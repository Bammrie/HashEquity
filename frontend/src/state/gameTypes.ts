export type RewardDefinition =
  | {
      type: 'unminted_hash';
      value: number;
    }
  | {
      type: 'mini_game';
      label: string;
    };

export type GameObjectType =
  | 'object0-0'
  | 'object0-1'
  | 'object0-2'
  | 'object0-3'
  | 'object0-4'
  | 'object0-5'
  | 'object0-6'
  | 'object0-7'
  | 'object0-8'
  | 'object0-9'
  | 'object1-0';

export type GameObjectSize = 'small' | 'medium' | 'large';

export type SpawnDefinition = {
  type: GameObjectType;
  name: string;
  spawnChance: number;
  reward: RewardDefinition;
  image: string;
  size: GameObjectSize;
  health: number;
};
