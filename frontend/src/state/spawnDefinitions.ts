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
import fluxPrism from '../assets/coins/flux-prism.svg';
import forgeBlock from '../assets/coins/forge-block.svg';
import hashCore from '../assets/coins/hash-core.svg';
import jackpotChip from '../assets/coins/jackpot-chip.svg';
import novaGem from '../assets/coins/nova-gem.svg';
import plinkoDisc from '../assets/coins/plinko-disc.svg';
import prismSpark from '../assets/coins/prism-spark.svg';
import quantumLattice from '../assets/coins/quantum-lattice.svg';
import vaultEmblem from '../assets/coins/vault-emblem.svg';
import wheelToken from '../assets/coins/wheel-token.svg';
import type { SpawnDefinition } from './gameTypes';

export const spawnDefinitions: SpawnDefinition[] = [
  {
    type: 'object0-0',
    name: 'Object 0-0',
    image: object00,
    size: 'small',
    spawnChance: 0.39,
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
  {
    type: 'flux-prism',
    name: 'Flux Prism',
    image: fluxPrism,
    size: 'small',
    spawnChance: 0.001,
    reward: {
      type: 'item',
      itemId: 'flux-prism',
      name: 'Flux Prism',
      image: fluxPrism,
      description: 'A refracted shard humming with multidimensional energy.',
    },
    health: 1,
  },
  {
    type: 'forge-block',
    name: 'Forge Block',
    image: forgeBlock,
    size: 'small',
    spawnChance: 0.001,
    reward: {
      type: 'item',
      itemId: 'forge-block',
      name: 'Forge Block',
      image: forgeBlock,
      description: 'Residual alloy from the earliest HASH minting prototypes.',
    },
    health: 1,
  },
  {
    type: 'hash-core',
    name: 'HASH Core',
    image: hashCore,
    size: 'small',
    spawnChance: 0.001,
    reward: {
      type: 'item',
      itemId: 'hash-core',
      name: 'HASH Core',
      image: hashCore,
      description: 'A stabilized micro-reactor that powers the Vault engines.',
    },
    health: 1,
  },
  {
    type: 'jackpot-chip',
    name: 'Jackpot Chip',
    image: jackpotChip,
    size: 'small',
    spawnChance: 0.001,
    reward: {
      type: 'item',
      itemId: 'jackpot-chip',
      name: 'Jackpot Chip',
      image: jackpotChip,
      description: 'Lucky vault casino chip rumored to double future payouts.',
    },
    health: 1,
  },
  {
    type: 'nova-gem',
    name: 'Nova Gem',
    image: novaGem,
    size: 'small',
    spawnChance: 0.001,
    reward: {
      type: 'item',
      itemId: 'nova-gem',
      name: 'Nova Gem',
      image: novaGem,
      description: 'Compressed starfire crystal from the HashEquity nebula mines.',
    },
    health: 1,
  },
  {
    type: 'plinko-disc',
    name: 'Plinko Disc',
    image: plinkoDisc,
    size: 'small',
    spawnChance: 0.001,
    reward: {
      type: 'item',
      itemId: 'plinko-disc',
      name: 'Plinko Disc',
      image: plinkoDisc,
      description: 'Collector disc from the first Vault-side plinko tournament.',
    },
    health: 1,
  },
  {
    type: 'prism-spark',
    name: 'Prism Spark',
    image: prismSpark,
    size: 'small',
    spawnChance: 0.001,
    reward: {
      type: 'item',
      itemId: 'prism-spark',
      name: 'Prism Spark',
      image: prismSpark,
      description: 'Captured lightning from a HASH resonance cascade.',
    },
    health: 1,
  },
  {
    type: 'quantum-lattice',
    name: 'Quantum Lattice',
    image: quantumLattice,
    size: 'small',
    spawnChance: 0.001,
    reward: {
      type: 'item',
      itemId: 'quantum-lattice',
      name: 'Quantum Lattice',
      image: quantumLattice,
      description: 'Intricate frame used to stabilize volatile HASH experiments.',
    },
    health: 1,
  },
  {
    type: 'vault-emblem',
    name: 'Vault Emblem',
    image: vaultEmblem,
    size: 'small',
    spawnChance: 0.001,
    reward: {
      type: 'item',
      itemId: 'vault-emblem',
      name: 'Vault Emblem',
      image: vaultEmblem,
      description: 'Prestige badge issued to keepers of the HashVault.',
    },
    health: 1,
  },
  {
    type: 'wheel-token',
    name: 'Wheel Token',
    image: wheelToken,
    size: 'small',
    spawnChance: 0.001,
    reward: {
      type: 'item',
      itemId: 'wheel-token',
      name: 'Wheel Token',
      image: wheelToken,
      description: 'Redeemable token for future Vault wheel spins.',
    },
    health: 1,
  },
];
