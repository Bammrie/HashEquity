import hashCore from '../assets/coins/hash-core.svg';
import prismSpark from '../assets/coins/prism-spark.svg';
import quantumLattice from '../assets/coins/quantum-lattice.svg';
import fluxPrism from '../assets/coins/flux-prism.svg';
import forgeBlock from '../assets/coins/forge-block.svg';
import novaGem from '../assets/coins/nova-gem.svg';
import wheelToken from '../assets/coins/wheel-token.svg';
import jackpotChip from '../assets/coins/jackpot-chip.svg';
import plinkoDisc from '../assets/coins/plinko-disc.svg';
import vaultEmblem from '../assets/coins/vault-emblem.svg';
import type { SpawnDefinition } from './gameTypes';

export const spawnDefinitions: SpawnDefinition[] = [
  {
    type: 'circle',
    name: 'Hash Core',
    image: hashCore,
    size: 'medium',
    spawnChance: 0.18,
    reward: { type: 'unminted_hash', value: 0.00000001 },
    health: 1,
  },
  {
    type: 'triangle',
    name: 'Prism Spark',
    image: prismSpark,
    size: 'small',
    spawnChance: 0.12,
    reward: { type: 'unminted_hash', value: 0.000000014 },
    health: 1,
  },
  {
    type: 'hexagon',
    name: 'Quantum Lattice',
    image: quantumLattice,
    size: 'large',
    spawnChance: 0.1,
    reward: { type: 'unminted_hash', value: 0.000000018 },
    health: 1,
  },
  {
    type: 'prism',
    name: 'Flux Prism',
    image: fluxPrism,
    size: 'small',
    spawnChance: 0.08,
    reward: { type: 'unminted_hash', value: 0.00000002 },
    health: 1,
  },
  {
    type: 'cube',
    name: 'Forge Block',
    image: forgeBlock,
    size: 'medium',
    spawnChance: 0.07,
    reward: { type: 'unminted_hash', value: 0.000000024 },
    health: 1,
  },
  {
    type: 'diamond',
    name: 'Nova Gem',
    image: novaGem,
    size: 'medium',
    spawnChance: 0.1,
    reward: { type: 'unminted_hash', value: 0.00000003 },
    health: 1,
  },
  {
    type: 'wheel',
    name: 'Wheel Token',
    image: wheelToken,
    size: 'large',
    spawnChance: 0.12,
    reward: { type: 'mini_game', label: 'Wheel Spin' },
    health: 1,
  },
  {
    type: 'slot',
    name: 'Jackpot Chip',
    image: jackpotChip,
    size: 'medium',
    spawnChance: 0.08,
    reward: { type: 'mini_game', label: 'Slot Rush' },
    health: 1,
  },
  {
    type: 'plinko',
    name: 'Plinko Disc',
    image: plinkoDisc,
    size: 'small',
    spawnChance: 0.08,
    reward: { type: 'mini_game', label: 'Plinko Drop' },
    health: 1,
  },
  {
    type: 'vault',
    name: 'Vault Emblem',
    image: vaultEmblem,
    size: 'large',
    spawnChance: 0.07,
    reward: { type: 'unminted_hash', value: 0.00000005 },
    health: 3,
  },
];
