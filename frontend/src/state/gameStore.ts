import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const objectSprite00 = new URL('../../../images/Object 0-0.png', import.meta.url).href;
const objectSprite01 = new URL('../../../images/Object0-1.png', import.meta.url).href;
const objectSprite02 = new URL('../../../images/Object0-2.png', import.meta.url).href;
const objectSprite03 = new URL('../../../images/Object0-3.png', import.meta.url).href;
const objectSprite04 = new URL('../../../images/Object0-4.png', import.meta.url).href;
const objectSprite10 = new URL('../../../images/Object1-0.png', import.meta.url).href;
const objectSprite11 = new URL('../../../images/Object1-1.png', import.meta.url).href;
const objectSprite12 = new URL('../../../images/Object1-2.png', import.meta.url).href;
const objectSprite13 = new URL('../../../images/Object1-3.png', import.meta.url).href;
const objectSprite14 = new URL('../../../images/Object1-4.png', import.meta.url).href;

type RewardDefinition =
  | {
      type: 'unminted_hash';
      value: number;
    }
  | {
      type: 'mini_game';
      label: string;
    };

export type GameObjectType =
  | 'circle'
  | 'triangle'
  | 'hexagon'
  | 'prism'
  | 'cube'
  | 'diamond'
  | 'wheel'
  | 'slot'
  | 'plinko'
  | 'vault';

type ObjectSprite = {
  name: string;
  image: string;
  size: number;
};

type ObjectMotion = {
  x: number;
  y: number;
  floatDuration: number;
  floatDelay: number;
  driftX: number;
  driftY: number;
};

export type SpawnDefinition = {
  type: GameObjectType;
  spawnChance: number;
  reward: RewardDefinition;
  sprite: ObjectSprite;
};

export type ActiveObject = SpawnDefinition & {
  id: string;
  health: number;
  motion: ObjectMotion;
};

const spawnTable: SpawnDefinition[] = [
  {
    type: 'circle',
    spawnChance: 0.13,
    reward: { type: 'unminted_hash', value: 0.000000012 },
    sprite: { name: 'Lumen Seed', image: objectSprite00, size: 110 },
  },
  {
    type: 'triangle',
    spawnChance: 0.1,
    reward: { type: 'unminted_hash', value: 0.000000016 },
    sprite: { name: 'Flux Bloom', image: objectSprite01, size: 120 },
  },
  {
    type: 'hexagon',
    spawnChance: 0.1,
    reward: { type: 'unminted_hash', value: 0.00000002 },
    sprite: { name: 'Spectral Prism', image: objectSprite02, size: 130 },
  },
  {
    type: 'prism',
    spawnChance: 0.08,
    reward: { type: 'unminted_hash', value: 0.000000024 },
    sprite: { name: 'Nebula Coil', image: objectSprite03, size: 124 },
  },
  {
    type: 'cube',
    spawnChance: 0.08,
    reward: { type: 'unminted_hash', value: 0.000000028 },
    sprite: { name: 'Vault Shard', image: objectSprite04, size: 120 },
  },
  {
    type: 'diamond',
    spawnChance: 0.11,
    reward: { type: 'unminted_hash', value: 0.000000032 },
    sprite: { name: 'Auric Spire', image: objectSprite10, size: 138 },
  },
  {
    type: 'wheel',
    spawnChance: 0.1,
    reward: { type: 'mini_game', label: 'Wheel Spin' },
    sprite: { name: 'Spin Catalyst', image: objectSprite11, size: 134 },
  },
  {
    type: 'slot',
    spawnChance: 0.1,
    reward: { type: 'mini_game', label: 'Slot Rush' },
    sprite: { name: 'Slot Matrix', image: objectSprite12, size: 126 },
  },
  {
    type: 'plinko',
    spawnChance: 0.1,
    reward: { type: 'mini_game', label: 'Plinko Drop' },
    sprite: { name: 'Plinko Cradle', image: objectSprite13, size: 132 },
  },
  {
    type: 'vault',
    spawnChance: 0.1,
    reward: { type: 'unminted_hash', value: 0.00000005 },
    sprite: { name: 'Hash Vault Core', image: objectSprite14, size: 148 },
  },
];

let nextObjectId = 1;
let nextMiniGameIndex = 0;

const miniGameRewardSequence = [0.00000002, 0.000000035, 0.00000005, 0.0000001];

let spawnCursor = 0;

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const createMotion = (): ObjectMotion => ({
  x: randomBetween(12, 88),
  y: randomBetween(14, 86),
  floatDuration: randomBetween(6, 11),
  floatDelay: randomBetween(-6, 0),
  driftX: randomBetween(-18, 18),
  driftY: randomBetween(-12, 12),
});

const createObject = (): ActiveObject => {
  const definition = spawnTable[spawnCursor % spawnTable.length];
  spawnCursor += 1;
  const id = `object-${nextObjectId++}`;
  return {
    ...definition,
    id,
    health: definition.type === 'vault' ? 3 : 1,
    motion: createMotion(),
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
            `Destroyed ${target.sprite.name} for ${target.reward.value.toFixed(10)} unminted HASH.`,
          );
        } else {
          const payout = miniGameRewardSequence[nextMiniGameIndex % miniGameRewardSequence.length];
          nextMiniGameIndex += 1;
          miniGame = {
            label: target.reward.label,
            payout,
            status: 'pending',
          };
          events = pushEvent(
            events,
            `${target.sprite.name} triggered ${target.reward.label}! Resolve to claim ${payout.toFixed(10)} HASH.`,
          );
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

export const spawnTableSpec = spawnTable;
