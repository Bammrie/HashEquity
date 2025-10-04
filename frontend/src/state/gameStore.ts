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

type BackendInventoryItem = {
  itemId?: string;
  name?: string;
  image?: string;
  quantity?: number | string;
  lastUpdatedAt?: number | string | Date;
  description?: string | null;
};

const parseBalance = (value: number | string): number => {
  const numeric = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Number(numeric.toFixed(10));
};

const resolveInventoryTimestamp = (
  value: BackendInventoryItem['lastUpdatedAt'],
): number => {
  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isFinite(timestamp) ? timestamp : Date.now();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }

    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }

  return Date.now();
};

const parseInventoryEntries = (
  entries?: BackendInventoryItem[] | null,
): InventoryItem[] | undefined => {
  if (entries === undefined) {
    return undefined;
  }

  if (!Array.isArray(entries)) {
    return [];
  }

  const normalized: InventoryItem[] = [];

  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }

    const itemId = typeof entry.itemId === 'string' ? entry.itemId.trim() : '';
    if (!itemId) {
      continue;
    }

    const name =
      typeof entry.name === 'string' && entry.name.trim().length > 0
        ? entry.name.trim()
        : itemId;

    const image =
      typeof entry.image === 'string' && entry.image.trim().length > 0
        ? entry.image
        : '';

    const rawQuantity =
      typeof entry.quantity === 'string' ? Number(entry.quantity) : entry.quantity;

    const quantity = Number.isFinite(rawQuantity) && rawQuantity !== undefined
      ? Math.max(1, Math.floor(Number(rawQuantity)))
      : 1;

    const description =
      typeof entry.description === 'string' && entry.description.trim().length > 0
        ? entry.description
        : undefined;

    normalized.push({
      itemId,
      name,
      image,
      quantity,
      lastUpdated: resolveInventoryTimestamp(entry.lastUpdatedAt),
      description,
    });
  }

  return normalized;
};

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

export type InventoryItem = {
  itemId: string;
  name: string;
  image: string;
  quantity: number;
  lastUpdated: number;
  description?: string;
};

type DestroyOutcome = 'missing' | 'damaged' | 'destroyed';

type GameState = {
  objects: ActiveObject[];
  balances: EconomyBalances;
  objectsDestroyed: number;
  events: EventEntry[];
  miniGame: MiniGameState | null;
  personalDestroyed: number;
  inventory: InventoryItem[];
  destroyObject: (id: string) => DestroyOutcome;
  resolveMiniGame: () => void;
  settleDailyMint: (result: { mintedAmount: number; vaultTax: number }) => void;
  tradeInForHash: (result: { tradedAmount: number; mintedAmount: number }) => void;
  syncBackendBalances: (payload: {
    hashBalance: number | string;
    unmintedHash: number | string;
    vaultHashBalance?: number | string | null;
    objectsDestroyed?: number | string;
    inventory?: BackendInventoryItem[] | null;
  }) => void;
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
    objectsDestroyed: 0,
    events: [],
    miniGame: null,
    personalDestroyed: 0,
    inventory: [],
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
        let inventory = state.inventory;

        if (target.reward.type === 'unminted_hash') {
          balances.unminted = Number((balances.unminted + target.reward.value).toFixed(10));
          events = pushEvent(
            events,
            `Destroyed ${target.name} for ${target.reward.value.toFixed(10)} unminted HASH.`,
          );
        } else if (target.reward.type === 'mini_game') {
          const payout = miniGameRewardSequence[nextMiniGameIndex % miniGameRewardSequence.length];
          nextMiniGameIndex += 1;
          miniGame = {
            label: target.reward.label,
            payout,
            status: 'pending',
          };
          events = pushEvent(events, `${target.reward.label} ready! Resolve to claim ${payout.toFixed(10)} HASH.`);
        } else if (target.reward.type === 'item') {
          const reward = target.reward;
          const now = Date.now();
          const existingIndex = inventory.findIndex((entry) => entry.itemId === reward.itemId);

          if (existingIndex >= 0) {
            const updated = [...inventory];
            const existing = updated[existingIndex];
            updated[existingIndex] = {
              ...existing,
              quantity: existing.quantity + 1,
              lastUpdated: now,
              name: reward.name,
              image: reward.image || existing.image,
              description: reward.description ?? existing.description,
            };
            inventory = updated;
          } else {
            inventory = [
              ...inventory,
              {
                itemId: reward.itemId,
                name: reward.name,
                image: reward.image,
                quantity: 1,
                lastUpdated: now,
                description: reward.description,
              },
            ];
          }

          events = pushEvent(events, `Recovered ${reward.name}. Added to your inventory.`);
        }

        outcome = 'destroyed';
        return {
          ...state,
          objects: respawned,
          balances,
          miniGame,
          events,
          inventory,
          objectsDestroyed: state.objectsDestroyed + 1,
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
    settleDailyMint: ({ mintedAmount, vaultTax }) => {
      set((state) => {
        const events = pushEvent(
          state.events,
          `Daily mint settled. Minted ${mintedAmount.toFixed(10)} HASH and sent ${vaultTax.toFixed(10)} HASH to the Vault.`,
        );
        return {
          ...state,
          balances: {
            ...state.balances,
            vault: Number((state.balances.vault + vaultTax).toFixed(10)),
          },
          events,
        };
      }, false, 'settleDailyMint');
    },
    tradeInForHash: ({ tradedAmount, mintedAmount }) => {
      set((state) => {
        const events = pushEvent(
          state.events,
          `Traded ${tradedAmount.toFixed(10)} unminted for ${mintedAmount.toFixed(10)} HASH. Vault paid out ${mintedAmount.toFixed(10)} HASH.`,
        );

        const projectedVault = Number((state.balances.vault - mintedAmount).toFixed(10));
        const normalizedVault = Number.isFinite(projectedVault) ? projectedVault : state.balances.vault;
        const vault = normalizedVault < 0 ? 0 : normalizedVault;

        return {
          ...state,
          balances: {
            ...state.balances,
            vault,
          },
          events,
        };
      }, false, 'tradeInForHash');
    },
    syncBackendBalances: ({
      hashBalance,
      unmintedHash,
      objectsDestroyed,
      vaultHashBalance,
      inventory: backendInventory,
    }) => {
      const parseDestroyed = (value?: number | string) => {
        if (value === undefined || value === null) {
          return undefined;
        }

        const numeric = typeof value === 'string' ? Number(value) : value;
        if (!Number.isFinite(numeric)) {
          return undefined;
        }

        return Math.max(0, Math.floor(numeric));
      };

      const destroyed = parseDestroyed(objectsDestroyed);
      const normalizedInventory = parseInventoryEntries(backendInventory);

      set((state) => ({
        ...state,
        balances: {
          ...state.balances,
          hash: parseBalance(hashBalance),
          unminted: parseBalance(unmintedHash),
          vault:
            vaultHashBalance !== undefined && vaultHashBalance !== null
              ? parseBalance(vaultHashBalance)
              : state.balances.vault,
        },
        objectsDestroyed:
          destroyed !== undefined ? destroyed : state.objectsDestroyed,
        inventory:
          normalizedInventory !== undefined ? normalizedInventory : state.inventory,
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
