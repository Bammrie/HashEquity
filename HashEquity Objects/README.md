# HashEquity Object Art

The interactive coin art used on the HashEquity game board now lives under `frontend/src/assets/coins` where the Vite bundler can import it directly.

This directory is kept to document the available coin objects and provide a quick reference to the canonical filenames:

- `hash-core.svg`
- `prism-spark.svg`
- `quantum-lattice.svg`
- `flux-prism.svg`
- `forge-block.svg`
- `nova-gem.svg`
- `wheel-token.svg`
- `jackpot-chip.svg`
- `plinko-disc.svg`
- `vault-emblem.svg`

When adding new objects, drop the source art here and copy it into `frontend/src/assets/coins` so it can be bundled with the frontend app.
