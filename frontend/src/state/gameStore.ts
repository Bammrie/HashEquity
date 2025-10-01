import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import object00 from '../../images/Object0-0.png';
import object01 from '../../images/Object0-1.png';
import object02 from '../../images/Object0-2.png';
import object03 from '../../images/Object0-3.png';
import object04 from '../../images/Object0-4.png';
import object10 from '../../images/Object1-0.png';
import object11 from '../../images/Object1-1.png';
import object12 from '../../images/Object1-2.png';
import object13 from '../../images/Object1-3.png';
import object14 from '../../images/Object1-4.png';
import object20 from '../../images/Object2-0.png';

export type MiniGameType = 'plinko';

export type RewardDefinition =
  | {
      type: 'unminted_hash';
      value: number;
    }
  | {
      type: 'mini_game';
      label: string;
      miniGameType: MiniGameType;
    };

type ObjectConfig = {
  key: string;
  image: string;
  weight: number;
  reward: RewardDefinition;
  health: number;
};

export type ObjectDefinition = {
  key: string;
  image: string;
  spawnChance: number;
  reward: RewardDefinition;
  health: number;
};

export type ActiveObject = {
  id: string;
  definitionKey: string;
  image: string;
  reward: RewardDefinition;
  health: number;
};

const objectConfigs: ObjectConfig[] = [
  { key: 'Object0-0', image: object00, weight: 8, reward: { type: 'mini_game', label: 'Plinko Mini Game', miniGameType: 'plinko' }, health: 1 },
  { key: 'Object0-1', image: object01, weight: 8, reward: { type: 'mini_game', label: 'Plinko Mini Game', miniGameType: 'plinko' }, health: 1 },
  { key: 'Object0-2', image: object02, weight: 8, reward: { type: 'mini_game', label: 'Plinko Mini Game', miniGameType: 'plinko' }, health: 1 },
  { key: 'Object0-3', image: object03, weight: 8, reward: { type: 'mini_game', label: 'Plinko Mini Game', miniGameType: 'plinko' }, health: 1 },
  { key: 'Object0-4', image: object04, weight: 8, reward: { type: 'mini_game', label: 'Plinko Mini Game', miniGameType: 'plinko' }, health: 1 },
  { key: 'Object1-0', image: object10, weight: 7, reward: { type: 'unminted_hash', value: 0.00000002 }, health: 1 },
  { key: 'Object1-1', image: object11, weight: 7, reward: { type: 'unminted_hash', value: 0.000000028 }, health: 1 },
  { key: 'Object1-2', image: object12, weight: 6, reward: { type: 'unminted_hash', value: 0.000000032 }, health: 1 },
  { key: 'Object1-3', image: object13, weight: 5, reward: { type: 'unminted_hash', value: 0.00000004 }, health: 1 },
  { key: 'Object1-4', image: object14, weight: 5, reward: { type: 'unminted_hash', value: 0.00000006 }, health: 1 },
  { key: 'Object2-0', image: object20, weight: 30, reward: { type: 'unminted_hash', value: 0.00000008 }, health: 1 },
];

const totalWeight = objectConfigs.reduce((accumulator, config) => accumulator + config.weight, 0);

const objectDefinitions: ObjectDefinition[] = objectConfigs.map((config) => ({
  key: config.key,
  image: config.image,
  reward: config.reward,
  health: config.health,
  spawnChance: config.weight / totalWeight,
}));

let nextObjectId = 1;
let nextMiniGameIndex = 0;

const miniGameRewardSequence = [0.00000002, 0.000000035, 0.00000005, 0.0000001];

const spawnCycle: string[] = (() => {
  const queue = objectConfigs.map((config) => ({ key: config.key, remaining: config.weight }));
  const sequence: string[] = [];

  let hasRemaining = true;
  while (hasRemaining) {
    hasRemaining = false;
    for (const entry of queue) {
      if (entry.remaining > 0) {
        sequence.push(entry.key);
        entry.remaining -= 1;
        hasRemaining = true;
      }
    }
  }

  return sequence;
})();

let spawnCursor = 0;

const createObject = (): ActiveObject => {
  const key = spawnCycle[spawnCursor % spawnCycle.length];
  spawnCursor += 1;
  const definition = objectDefinitions.find((entry) => entry.key === key) ?? objectDefinitions[0];
  const id = `object-${nextObjectId++}`;
  return {
    id,
    definitionKey: definition.key,
    image: definition.image,
    reward: definition.reward,
    health: definition.health,
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

type GameState = {
  objects: ActiveObject[];
  balances: EconomyBalances;
  events: EventEntry[];
  miniGame: MiniGameState | null;
  destroyObject: (id: string) => void;
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
      set((state) => {
        const target = state.objects.find((obj) => obj.id === id);
        if (!target) {
          return state;
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
            `Destroyed ${target.definitionKey} for ${target.reward.value.toFixed(10)} unminted HASH.`,
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

        return {
          ...state,
          objects: respawned,
          balances,
          miniGame,
          events,
        };
      }, false, 'destroyObject');
    },
    resolveMiniGame: () => {
      const { miniGame } = get();
      if (!miniGame || miniGame.status !== 'pending') {
        return;
      }

      set((state) => {
        const balances = { ...state.balances };
        balances.unminted = Number((balances.unminted + miniGame.payout).toFixed(10));
        const events = pushEvent(state.events, `${miniGame.label} resolved for ${miniGame.payout.toFixed(10)} unminted HASH.`);
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
        const events = pushEvent(state.events, `Daily mint settled. Vault collected ${vaultTax.toFixed(10)} HASH.`);
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
        const events = pushEvent(state.events, `Traded ${amount.toFixed(10)} unminted for ${minted.toFixed(10)} HASH.`);
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

export const spawnTableSpec = objectDefinitions;
