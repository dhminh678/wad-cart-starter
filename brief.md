# Task Brief: cartTotal Implementation & Test Suite

## 1. Scope & Technical Constraints
- **Target Files:**
  - `src/cart.js` — Core implementation of `cartTotal(items, options)`.
  - `test/cart.test.js` — Test suite for `cartTotal`.
- **Zero External Dependencies Constraint:**
  - Plain modern JavaScript (ES Modules, `"type": "module"`).
  - Absolutely **zero third-party dependencies** in `dependencies` or `devDependencies` (Jest and any npm packages are strictly forbidden).
  - Unit tests MUST use Node.js built-in test runner (`node:test`) and strict assertion library (`node:assert/strict`).
  - Linting/gate must use Node built-ins (e.g. `node --check`).

## 2. Function Signature & Contracts
```javascript
export function cartTotal(items, options)
```
- `items`: Array of objects `[{ name: string, price: number, qty: number }]`.
- `options`: Object `{ vatRate: number, freeShipFrom: number, shipFee: number }`.
- **Return Value:** Single `Number`, rounded to the nearest whole đồng (`Math.round()`). Must never return a string, `NaN`, or floating point đồng.

## 3. Strict Business Logic & Calculation Order
1. **Empty Cart Special Rule:**
   - If `items` is empty (`items.length === 0`), return `0` immediately.
   - Do NOT apply VAT or shipping fee to an empty cart.

2. **Input Validation & Error Handling:**
   - **Price Rule:** Price must be non-negative. If `item.price < 0` (or not a valid finite number), throw a `RangeError`. (Note: `price === 0` is allowed for free gifts).
   - **Quantity Rule (Strict Positive Integer):** Quantity must be a strictly positive integer ($qty \in \{1, 2, 3, \dots\}$). If `item.qty <= 0` (including `0`, `-1`, `-2`), or if `item.qty` is not an integer (e.g., `1.5`, `0.5`, `NaN`, string), throw a `RangeError`.

3. **Subtotal:**
   - Sum of `item.price * item.qty` across all items in the cart.

4. **VAT:**
   - `VAT = subtotal * vatRate`.

5. **Shipping Fee & Free Shipping Threshold (Non-Ambiguous Specification):**
   - Free shipping qualification is determined **STRICTLY by comparing `subtotal` against `freeShipFrom`**:
     $$\text{shipping} = \begin{cases} 0 & \text{if } \text{subtotal} \ge \text{freeShipFrom} \\ \text{shipFee} & \text{if } \text{subtotal} < \text{freeShipFrom} \end{cases}$$
   - **CRITICAL:** The threshold check MUST NEVER be applied to the total after VAT (`subtotal + VAT`).
   - *Example Bug Scenario Avoidance:* If `subtotal = 480,000`, `vatRate = 0.08` ($\text{VAT} = 38,400$), `freeShipFrom = 500,000`, and `shipFee = 30,000`:
     - $\text{subtotal} + \text{VAT} = 518,400$ ($> 500,000$).
     - However, because $\text{subtotal} = 480,000 < 500,000$, free shipping is NOT granted.
     - Shipping fee of $30,000$ MUST be charged.
     - Correct result: $480,000 + 38,400 + 30,000 = \mathbf{548,400}$ (NOT $518,400$).

6. **Final Total:**
   - $\text{total} = \text{subtotal} + \text{VAT} + \text{shipping}$.
   - Rounded to whole đồng using `Math.round(total)`.

## 4. Required Test Coverage
The test suite in `test/cart.test.js` must cover:
1. Standard worked example from README ($405,000 \to 467,400$).
2. Empty cart returns `0` (type `number`).
3. Free shipping threshold boundary conditions:
   - Subtotal below threshold but total after VAT above threshold (charges shipping, e.g. $480,000 \to 548,400$).
   - Subtotal exactly at threshold (waives shipping).
   - Subtotal above threshold (waives shipping).
4. Quantity validation throwing `RangeError`:
   - $qty = 0$.
   - $qty = -1$ (negative integer).
   - $qty = 1.5$ (float).
   - Non-number / invalid string.
5. Price validation:
   - Negative price throwing `RangeError`.
   - $price = 0$ (free gift) allowed without throwing.
6. Rounding:
   - Proper whole đồng rounding with `Math.round()`.