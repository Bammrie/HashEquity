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
