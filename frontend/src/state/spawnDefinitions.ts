import object00 from '../assets/coins/Object0-0.png';
import object01 from '../assets/coins/Object0-1.png';
import object02 from '../assets/coins/Object0-2.png';
import object03 from '../assets/coins/Object0-3.png';
import object04 from '../assets/coins/Object0-4.png';
import object05 from '../assets/coins/Object0-5.png';
import object06 from '../assets/coins/Object0-6.png';
import object07 from '../assets/coins/Object0-7.png';
import object08 from '../assets/coins/Object0-8.png';
import object09 from '../assets/coins/Object0-9.png';
import object10 from '../assets/coins/Object1-0.png';
import object11 from '../assets/coins/Object1-1.png';
import object12 from '../assets/coins/Object1-2.png';
import type { SpawnDefinition } from './gameTypes';

export const spawnDefinitions: SpawnDefinition[] = [
  {
    type: 'object0-0',
    name: 'Object 0-0',
    image: object00,
    size: 'small',
    spawnChance: 0.4,
    reward: { type: 'unminted_hash', value: 0.00000001 },
    health: 1,
  },
  {
    type: 'object0-1',
    name: 'Object 0-1',
    image: object01,
    size: 'small',
    spawnChance: 0.2,
    reward: { type: 'unminted_hash', value: 0.00000005 },
    health: 1,
  },
  {
    type: 'object0-2',
    name: 'Object 0-2',
    image: object02,
    size: 'small',
    spawnChance: 0.13,
    reward: { type: 'unminted_hash', value: 0.0000002 },
    health: 2,
  },
  {
    type: 'object0-3',
    name: 'Object 0-3',
    image: object03,
    size: 'small',
    spawnChance: 0.09,
    reward: { type: 'unminted_hash', value: 0.0000005 },
    health: 3,
  },
  {
    type: 'object0-4',
    name: 'Object 0-4',
    image: object04,
    size: 'small',
    spawnChance: 0.055,
    reward: { type: 'unminted_hash', value: 0.000001 },
    health: 4,
  },
  {
    type: 'object0-5',
    name: 'Object 0-5',
    image: object05,
    size: 'small',
    spawnChance: 0.019,
    reward: { type: 'unminted_hash', value: 0.0000025 },
    health: 5,
  },
  {
    type: 'object0-6',
    name: 'Object 0-6',
    image: object06,
    size: 'small',
    spawnChance: 0.004,
    reward: { type: 'unminted_hash', value: 0.000005 },
    health: 6,
  },
  {
    type: 'object0-7',
    name: 'Object 0-7',
    image: object07,
    size: 'small',
    spawnChance: 0.0014,
    reward: { type: 'unminted_hash', value: 0.00001 },
    health: 7,
  },
  {
    type: 'object0-8',
    name: 'Object 0-8',
    image: object08,
    size: 'small',
    spawnChance: 0.0003,
    reward: { type: 'unminted_hash', value: 0.000025 },
    health: 8,
  },
  {
    type: 'object0-9',
    name: 'Object 0-9',
    image: object09,
    size: 'small',
    spawnChance: 0.0002,
    reward: { type: 'unminted_hash', value: 0.00005 },
    health: 1,
  },
  {
    type: 'object1-0',
    name: 'Object 1-0',
    image: object10,
    size: 'small',
    spawnChance: 0.00005,
    reward: { type: 'unminted_hash', value: 0.0001 },
    health: 1,
  },
  {
    type: 'object1-1',
    name: 'Hash Relic Prototype',
    image: object11,
    size: 'small',
    spawnChance: 0.00005,
    reward: {
      type: 'item',
      itemId: 'object1-1',
      name: 'Hash Relic Prototype',
      image: object11,
      description: 'First collectible minted from destroy rewards.',
    },
    health: 1,
  },
  {
    type: 'object1-2',
    name: 'Object 1-2',
    image: object12,
    size: 'small',
    spawnChance: 0.1,
    reward: { type: 'unminted_hash', value: 0.000000025 },
    health: 1,
  },
];
