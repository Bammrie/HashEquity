# AGENTS.md

## Scope
These instructions apply to the entire backend repository and any files within it.

## Mission-critical context
- The frontend expects the backend to expose the following API routes under `/api`:
  - `GET /game/stats` → returns an array of `{ image, name, destroyed }`.
  - `GET /game/balances?wallet=<address>` → returns `{ hashBalance, unmintedHash }`.
  - `POST /game/destroy` → accepts `{ wallet, objectId }` and returns the updated balances.
- Preserve these routes, shapes, and HTTP status codes when making changes so the deployed frontend stays functional.
- Keep CORS open for `https://www.hashequity.com` and any staging domains used by the frontend.

## Coding & review guidelines
- Match the existing code style and formatter configuration (run the repo’s formatter/linter before committing).
- Keep environment variables, secrets, and service URLs in configuration files or Railway variables—never hard-code credentials.
- When touching business logic, add or update unit/integration tests that cover the new behavior.

## Testing expectations
- Run `npm test` (or the equivalent script defined in `package.json`) before requesting review.
- Call out any skipped or failing tests explicitly in the final message, with reasons and follow-up tasks if needed.

## Git & PR conventions
- Use conventional, descriptive commit messages.
- In the final response, include:
  - A summary of the changes.
  - Test commands run (or explain why none were run).
  - Any deployment considerations (migrations, config updates, etc.).

