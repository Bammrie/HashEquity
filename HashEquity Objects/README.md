# HashEquity Object Art

The interactive coin art used on the HashEquity game board now lives under `frontend/src/assets/coins` where the Vite bundler can import it directly.

This directory is kept to document the available coin objects and provide a quick reference to the canonical filenames. The
current spawn table uses the numbered PNG set below, which mirrors the data encoded in `frontend/src/state/spawnDefinitions.ts`:

- `Object0-0.png`
- `Object0-1.png`
- `Object0-2.png`
- `Object0-3.png`
- `Object0-4.png`
- `Object0-5.png`
- `Object0-6.png`
- `Object0-7.png`
- `Object0-8.png`
- `Object0-9.png`
- `Object1-0.png`

When adding new objects, drop the source art here and copy it into `frontend/src/assets/coins` so it can be bundled with the
frontend app. Remember to update the spawn table definitions if filenames or reward data change.
