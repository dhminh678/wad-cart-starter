# WAD Cart Total Project

## Stack
- Plain JavaScript (ES6+ ES Modules).
- Node.js (Built-in test runner `node:test` and assertion library `node:assert/strict`).
- ZERO external dependencies (No Jest, no third-party packages).

## Commands
- Run tests: `npm test` (executes `node --test`)
- Check syntax/lint: `npm run lint` (executes `node --check src/cart.js test/cart.test.js`)
- Run full gate: `npm run gate` (syntax check + test suite)

## Rules
- NEVER install or use third-party libraries/dependencies in `package.json`, `src/`, or `test/`.
- NEVER return a string from `cartTotal`. The return value must be a `Number`, rounded to whole đồng via `Math.round()`.
- Do not modify the function signature of `cartTotal(items, options)`.
- Free shipping threshold (`freeShipFrom`) MUST be evaluated strictly against `subtotal`, NEVER against total after VAT.
- A negative price (`price < 0`) or quantity that is not a positive integer (`!Number.isInteger(qty) || qty <= 0`) MUST throw a `RangeError`.
- An empty cart (`items.length === 0`) must return `0` with no VAT and no shipping.