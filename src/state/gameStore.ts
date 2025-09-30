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
import { appEnv } from '../config/env';

type RewardDefinition =
  | {
      type: 'unminted_hash';
      value: number;
    }
  | {
      type: 'mini_game';
      label: string;
    };

type ObjectPosition = {
  top: number;
  left: number;
  floatAnimation: 'floatSlow' | 'floatMedium' | 'floatWide';
  duration: number;
  delay: number;
};

type SpawnDefinition = {
  objectId: string;
  sprite: string;
  spawnChance: number;
  reward: RewardDefinition;
};

export type ActiveObject = SpawnDefinition & {
  instanceId: string;
  position: ObjectPosition;
};

type PlayerBalances = {
  hash: number;
  unminted: number;
};

type AdminState = {
  isLoggedIn: boolean;
  hashReserve: number;
  unmintedBank: number;
  nextMintTimestamp: number;
  lastSettlement: number | null;
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
  balances: PlayerBalances;
  admin: AdminState;
  events: EventEntry[];
  miniGame: MiniGameState | null;
  destroyObject: (instanceId: string) => void;
  resolveMiniGame: () => void;
  attemptAdminLogin: (passcode: string) => boolean;
  logoutAdmin: () => void;
  runScheduledMint: () => void;
  tradeInForHash: (amount: number) => void;
};

const ADMIN_PASSCODE = appEnv.adminPasscode;

const parseObjectId = (fileName: string): string => {
  const match = fileName.match(/Object(\d+)-(\d+)/);
  if (!match) {
    return fileName;
  }
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const numericId = major * 10 + minor;
  return `Object ${numericId}`;
};

const spawnTable: SpawnDefinition[] = [
  { objectId: parseObjectId('Object0-0'), sprite: object00, spawnChance: 0.12, reward: { type: 'unminted_hash', value: 0.000000012 } },
  { objectId: parseObjectId('Object0-1'), sprite: object01, spawnChance: 0.1, reward: { type: 'unminted_hash', value: 0.000000015 } },
  { objectId: parseObjectId('Object0-2'), sprite: object02, spawnChance: 0.09, reward: { type: 'unminted_hash', value: 0.00000002 } },
  { objectId: parseObjectId('Object0-3'), sprite: object03, spawnChance: 0.08, reward: { type: 'mini_game', label: 'Wheel Spin' } },
  { objectId: parseObjectId('Object0-4'), sprite: object04, spawnChance: 0.1, reward: { type: 'unminted_hash', value: 0.00000003 } },
  { objectId: parseObjectId('Object1-0'), sprite: object10, spawnChance: 0.11, reward: { type: 'mini_game', label: 'Slot Frenzy' } },
  { objectId: parseObjectId('Object1-1'), sprite: object11, spawnChance: 0.1, reward: { type: 'unminted_hash', value: 0.00000004 } },
  { objectId: parseObjectId('Object1-2'), sprite: object12, spawnChance: 0.09, reward: { type: 'unminted_hash', value: 0.00000005 } },
  { objectId: parseObjectId('Object1-3'), sprite: object13, spawnChance: 0.1, reward: { type: 'mini_game', label: 'Plinko Drop' } },
  { objectId: parseObjectId('Object1-4'), sprite: object14, spawnChance: 0.11, reward: { type: 'unminted_hash', value: 0.00000006 } },
];

const boardSlots: ObjectPosition[] = [
  { top: 12, left: 8, floatAnimation: 'floatSlow', duration: 14, delay: 0 },
  { top: 28, left: 20, floatAnimation: 'floatMedium', duration: 12, delay: 1.5 },
  { top: 45, left: 10, floatAnimation: 'floatWide', duration: 18, delay: 0.5 },
  { top: 62, left: 22, floatAnimation: 'floatMedium', duration: 16, delay: 2.5 },
  { top: 75, left: 8, floatAnimation: 'floatSlow', duration: 15, delay: 1 },
  { top: 15, left: 68, floatAnimation: 'floatMedium', duration: 14, delay: 2 },
  { top: 35, left: 82, floatAnimation: 'floatWide', duration: 19, delay: 0.75 },
  { top: 55, left: 70, floatAnimation: 'floatSlow', duration: 13, delay: 1.25 },
  { top: 72, left: 84, floatAnimation: 'floatMedium', duration: 17, delay: 0.35 },
  { top: 40, left: 48, floatAnimation: 'floatWide', duration: 20, delay: 1.8 },
];

let nextInstanceId = 1;
let spawnCursor = 0;
let nextMiniGameIndex = 0;

const miniGameRewardSequence = [0.000000025, 0.00000004, 0.000000055, 0.00000008];

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

const getNextMintTimestamp = (from: number): number => {
  const base = new Date(from);
  base.setUTCHours(0, 0, 0, 0);
  if (base.getTime() <= from) {
    base.setUTCDate(base.getUTCDate() + 1);
  }
  return base.getTime();
};

const createObject = (position: ObjectPosition): ActiveObject => {
  const definition = spawnTable[spawnCursor % spawnTable.length];
  spawnCursor += 1;
  return {
    ...definition,
    instanceId: `instance-${nextInstanceId++}`,
    position,
  };
};

const createInitialObjects = (): ActiveObject[] => boardSlots.map((slot) => createObject(slot));

const pushEvent = (events: EventEntry[], message: string): EventEntry[] => {
  const entry: EventEntry = {
    id: `event-${events.length + 1}`,
    timestamp: Date.now(),
    message,
  };
  return [entry, ...events].slice(0, 30);
};

export const useGameStore = create<GameState>()(
  devtools((set, get) => ({
    objects: createInitialObjects(),
    balances: {
      hash: 0,
      unminted: 0,
    },
    admin: {
      isLoggedIn: false,
      hashReserve: 1,
      unmintedBank: 0,
      nextMintTimestamp: getNextMintTimestamp(Date.now()),
      lastSettlement: null,
    },
    events: [],
    miniGame: null,
    destroyObject: (instanceId) => {
      set((state) => {
        const targetIndex = state.objects.findIndex((obj) => obj.instanceId === instanceId);
        if (targetIndex === -1) {
          return state;
        }
        const target = state.objects[targetIndex];
        const nextObject = createObject(target.position);

        const balances = { ...state.balances };
        let miniGame = state.miniGame;
        let events = state.events;

        if (target.reward.type === 'unminted_hash') {
          balances.unminted = Number((balances.unminted + target.reward.value).toFixed(10));
          events = pushEvent(
            events,
            `${target.objectId} shattered for ${target.reward.value.toFixed(10)} unminted HASH.`,
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
            `${target.reward.label} unlocked by ${target.objectId}. Resolve it to claim ${payout.toFixed(10)} unminted HASH.`,
          );
        }

        const objects = [...state.objects];
        objects[targetIndex] = nextObject;

        return {
          ...state,
          objects,
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
        const events = pushEvent(
          state.events,
          `${miniGame.label} paid out ${miniGame.payout.toFixed(10)} unminted HASH to the player ledger.`,
        );
        return {
          ...state,
          balances,
          miniGame: { ...miniGame, status: 'resolved' },
          events,
        };
      }, false, 'resolveMiniGame');
    },
    attemptAdminLogin: (passcode) => {
      const success = Boolean(passcode) && passcode === ADMIN_PASSCODE;
      if (success) {
        set((state) => ({
          ...state,
          admin: { ...state.admin, isLoggedIn: true },
          events: pushEvent(state.events, 'Admin vault access granted.'),
        }), false, 'attemptAdminLogin');
      } else {
        set((state) => ({
          ...state,
          events: pushEvent(state.events, 'Failed admin login attempt detected.'),
        }), false, 'attemptAdminLogin');
      }
      return success;
    },
    logoutAdmin: () => {
      set((state) => ({
        ...state,
        admin: { ...state.admin, isLoggedIn: false },
        events: pushEvent(state.events, 'Admin vault access closed.'),
      }), false, 'logoutAdmin');
    },
    runScheduledMint: () => {
      set((state) => {
        if (!state.admin.isLoggedIn) {
          return state;
        }
        const now = Date.now();
        if (now < state.admin.nextMintTimestamp) {
          return state;
        }
        if (state.balances.unminted <= 0) {
          return state;
        }

        const totalUnminted = state.balances.unminted;
        const mintedForPlayer = Number((totalUnminted * 0.8).toFixed(10));
        const mintedForAdmin = Number((totalUnminted * 0.2).toFixed(10));

        const balances: PlayerBalances = {
          hash: Number((state.balances.hash + mintedForPlayer).toFixed(10)),
          unminted: 0,
        };

        const admin: AdminState = {
          ...state.admin,
          hashReserve: Number((state.admin.hashReserve + mintedForAdmin).toFixed(10)),
          unmintedBank: Number((state.admin.unmintedBank + totalUnminted).toFixed(10)),
          lastSettlement: now,
          nextMintTimestamp: state.admin.nextMintTimestamp + MILLISECONDS_IN_DAY,
        };

        const events = pushEvent(
          state.events,
          `Daily mint executed. Player ledger received ${mintedForPlayer.toFixed(10)} HASH and the admin vault captured ${mintedForAdmin.toFixed(10)} HASH tax.`,
        );

        return {
          ...state,
          balances,
          admin,
          events,
        };
      }, false, 'runScheduledMint');
    },
    tradeInForHash: (amount) => {
      set((state) => {
        if (amount <= 0 || amount > state.balances.unminted) {
          return state;
        }
        const minted = Number((amount * 0.5).toFixed(10));
        if (minted > state.admin.hashReserve) {
          return {
            ...state,
            events: pushEvent(
              state.events,
              'Trade failed: admin vault does not have enough HASH reserve to complete the swap.',
            ),
          };
        }

        const balances: PlayerBalances = {
          hash: Number((state.balances.hash + minted).toFixed(10)),
          unminted: Number((state.balances.unminted - amount).toFixed(10)),
        };

        const admin: AdminState = {
          ...state.admin,
          hashReserve: Number((state.admin.hashReserve - minted).toFixed(10)),
          unmintedBank: Number((state.admin.unmintedBank + amount).toFixed(10)),
        };

        const events = pushEvent(
          state.events,
          `Player swapped ${amount.toFixed(10)} unminted HASH with the admin vault for ${minted.toFixed(10)} HASH.`,
        );

        return {
          ...state,
          balances,
          admin,
          events,
        };
      }, false, 'tradeInForHash');
    },
  }))
);

export const spawnTableSpec = spawnTable;
