import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { SpawnDefinition } from './gameTypes';
import { spawnDefinitions } from './spawnDefinitions';

type ObjectPosition = {
  x: number;
  y: number;
};

export type ActiveObject = SpawnDefinition & {
  id: string;
  position: ObjectPosition;
  floatDuration: number;
  floatDelay: number;
};

let nextObjectId = 1;
let nextMiniGameIndex = 0;

const miniGameRewardSequence = [0.00000002, 0.000000035, 0.00000005, 0.0000001];

const positionPadding: Record<SpawnDefinition['size'], number> = {
  small: 12,
  medium: 16,
  large: 20,
};

const pickSpawnDefinition = (): SpawnDefinition => {
  const roll = Math.random();
  let cumulative = 0;
  for (const definition of spawnDefinitions) {
    cumulative += definition.spawnChance;
    if (roll <= cumulative) {
      return definition;
    }
  }
  return spawnDefinitions[spawnDefinitions.length - 1];
};

const randomPosition = (size: SpawnDefinition['size']): ObjectPosition => {
  const padding = positionPadding[size];
  const min = padding;
  const max = 100 - padding;
  const x = Number((min + Math.random() * (max - min)).toFixed(2));
  const y = Number((min + Math.random() * (max - min)).toFixed(2));
  return { x, y };
};

const randomFloatDuration = () => Number((6 + Math.random() * 4).toFixed(2));
const randomFloatDelay = () => Number((Math.random() * 6).toFixed(2));

const createObject = (): ActiveObject => {
  const definition = pickSpawnDefinition();
  const id = `object-${nextObjectId++}`;
  return {
    ...definition,
    id,
    position: randomPosition(definition.size),
    floatDuration: randomFloatDuration(),
    floatDelay: randomFloatDelay(),
  };
};

const createInitialObjects = (): ActiveObject[] =>
  Array.from({ length: 10 }, () => createObject());

type EconomyBalances = {
  hash: number;
  unminted: number;
  vault: number;
};

type MiniGameState = {
  label: string;
  payout: number;
  status: 'pending' | 'resolved';
};

type EventEntry = {
  id: string;
  timestamp: number;
  message: string;
};

type DestroyOutcome = 'missing' | 'damaged' | 'destroyed';

type GameState = {
  objects: ActiveObject[];
  balances: EconomyBalances;
  events: EventEntry[];
  miniGame: MiniGameState | null;
  destroyObject: (id: string) => DestroyOutcome;
  resolveMiniGame: () => void;
  settleDailyMint: () => void;
  tradeInForHash: (amount: number) => void;
  syncBackendBalances: (payload: { hashBalance: number | string; unmintedHash: number | string }) => void;
  addEvent: (message: string) => void;
};

const pushEvent = (events: EventEntry[], message: string): EventEntry[] => {
  const entry: EventEntry = {
    id: `event-${events.length + 1}`,
    timestamp: Date.now(),
    message,
  };
  return [entry, ...events].slice(0, 25);
};

export const useGameStore = create<GameState>()(
  devtools((set, get) => ({
    objects: createInitialObjects(),
    balances: {
      hash: 0,
      unminted: 0,
      vault: 0,
    },
    events: [],
    miniGame: null,
    destroyObject: (id) => {
      let outcome: DestroyOutcome = 'missing';
      set((state) => {
        const target = state.objects.find((obj) => obj.id === id);
        if (!target) {
          return state;
        }

        if (target.health > 1) {
          const updatedTarget: ActiveObject = { ...target, health: target.health - 1 };
          const updatedObjects = state.objects.map((obj) => (obj.id === id ? updatedTarget : obj));
          const events = pushEvent(
            state.events,
            `${target.name} weakened. ${updatedTarget.health} health remaining.`,
          );
          outcome = 'damaged';
          return {
            ...state,
            objects: updatedObjects,
            events,
          };
        }

        const remaining = state.objects.filter((obj) => obj.id !== id);
        const respawned = [...remaining, createObject()];
        const balances = { ...state.balances };
        let miniGame = state.miniGame;
        let events = state.events;

        if (target.reward.type === 'unminted_hash') {
          balances.unminted = Number((balances.unminted + target.reward.value).toFixed(10));
          events = pushEvent(
            events,
            `Destroyed ${target.name} for ${target.reward.value.toFixed(10)} unminted HASH.`,
          );
        } else {
          const payout = miniGameRewardSequence[nextMiniGameIndex % miniGameRewardSequence.length];
          nextMiniGameIndex += 1;
          miniGame = {
            label: target.reward.label,
            payout,
            status: 'pending',
          };
          events = pushEvent(events, `${target.reward.label} ready! Resolve to claim ${payout.toFixed(10)} HASH.`);
        }

        outcome = 'destroyed';
        return {
          ...state,
          objects: respawned,
          balances,
          miniGame,
          events,
        };
      }, false, 'destroyObject');
      return outcome;
    },
    resolveMiniGame: () => {
      const { miniGame } = get();
      if (!miniGame || miniGame.status !== 'pending') {
        return;
      }

      set((state) => {
        const balances = { ...state.balances };
        balances.unminted = Number((balances.unminted + miniGame.payout).toFixed(10));
        const events = pushEvent(
          state.events,
          `${miniGame.label} resolved for ${miniGame.payout.toFixed(10)} unminted HASH.`,
        );
        return {
          ...state,
          balances,
          miniGame: { ...miniGame, status: 'resolved' },
          events,
        };
      }, false, 'resolveMiniGame');
    },
    settleDailyMint: () => {
      set((state) => {
        if (state.balances.unminted <= 0) {
          return state;
        }
        const mintedAmount = state.balances.unminted * 0.8;
        const vaultTax = state.balances.unminted * 0.2;
        const balances = {
          hash: Number((state.balances.hash + mintedAmount).toFixed(10)),
          unminted: 0,
          vault: Number((state.balances.vault + vaultTax).toFixed(10)),
        };
        const events = pushEvent(
          state.events,
          `Daily mint settled. Vault collected ${vaultTax.toFixed(10)} HASH.`,
        );
        return {
          ...state,
          balances,
          events,
        };
      }, false, 'settleDailyMint');
    },
    tradeInForHash: (amount) => {
      set((state) => {
        if (amount <= 0 || amount > state.balances.unminted) {
          return state;
        }
        const minted = amount * 0.5;
        const balances = {
          hash: Number((state.balances.hash + minted).toFixed(10)),
          unminted: Number((state.balances.unminted - amount).toFixed(10)),
          vault: state.balances.vault,
        };
        const events = pushEvent(
          state.events,
          `Traded ${amount.toFixed(10)} unminted for ${minted.toFixed(10)} HASH.`,
        );
        return {
          ...state,
          balances,
          events,
        };
      }, false, 'tradeInForHash');
    },
    syncBackendBalances: ({ hashBalance, unmintedHash }) => {
      const parse = (value: number | string) => {
        const numeric = typeof value === 'string' ? Number(value) : value;
        if (!Number.isFinite(numeric)) {
          return 0;
        }
        return Number(numeric.toFixed(10));
      };

      set((state) => ({
        ...state,
        balances: {
          ...state.balances,
          hash: parse(hashBalance),
          unminted: parse(unmintedHash),
        },
      }), false, 'syncBackendBalances');
    },
    addEvent: (message) => {
      set((state) => ({
        ...state,
        events: pushEvent(state.events, message),
      }), false, 'addEvent');
    },
  }))
);

export const spawnTableSpec = spawnDefinitions;
