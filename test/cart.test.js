import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cartTotal } from '../src/cart.js';

describe('cartTotal', () => {
  const defaultOptions = {
    vatRate: 0.08,
    freeShipFrom: 500000,
    shipFee: 30000,
  };

  it('calculates the worked example from the slides and README correctly', () => {
    const items = [
      { name: 'Áo thun', price: 180000, qty: 2 },
      { name: 'Sổ tay', price: 45000, qty: 1 },
    ];
    // subtotal = 360000 + 45000 = 405000
    // vat = 405000 * 0.08 = 32400
    // shipping = 30000 (405000 < 500000)
    // total = 405000 + 32400 + 30000 = 467400
    const total = cartTotal(items, defaultOptions);
    assert.strictEqual(total, 467400);
    assert.strictEqual(typeof total, 'number');
  });

  it('returns 0 for an empty cart without applying VAT or shipping', () => {
    const total = cartTotal([], defaultOptions);
    assert.strictEqual(total, 0);
    assert.strictEqual(typeof total, 'number');
  });

  describe('shipping fee and free shipping threshold', () => {
    it('applies shipping when subtotal is below threshold, even if total after VAT exceeds threshold', () => {
      // subtotal = 480000 (< 500000)
      // vat = 480000 * 0.08 = 38400
      // subtotal + vat = 518400 (exceeds 500000, but subtotal is 480000 < 500000)
      // shipping = 30000
      // total = 480000 + 38400 + 30000 = 548400
      const items = [{ name: 'Váy', price: 480000, qty: 1 }];
      assert.strictEqual(cartTotal(items, defaultOptions), 548400);
    });

    it('waives shipping fee when subtotal exactly equals freeShipFrom', () => {
      // subtotal = 500000 (== 500000)
      // vat = 500000 * 0.08 = 40000
      // shipping = 0
      // total = 540000
      const items = [{ name: 'Áo khoác', price: 500000, qty: 1 }];
      assert.strictEqual(cartTotal(items, defaultOptions), 540000);
    });

    it('waives shipping fee when subtotal strictly exceeds freeShipFrom', () => {
      // subtotal = 600000 (> 500000)
      // vat = 600000 * 0.08 = 48000
      // shipping = 0
      // total = 648000
      const items = [{ name: 'Giày sneaker', price: 300000, qty: 2 }];
      assert.strictEqual(cartTotal(items, defaultOptions), 648000);
    });
  });

  describe('quantity validation', () => {
    it('throws RangeError when quantity is 0', () => {
      const items = [{ name: 'Sản phẩm lỗi', price: 50000, qty: 0 }];
      assert.throws(
        () => cartTotal(items, defaultOptions),
        { name: 'RangeError' }
      );
    });

    it('throws RangeError when quantity is negative (-1)', () => {
      const items = [{ name: 'Sản phẩm lỗi', price: 50000, qty: -1 }];
      assert.throws(
        () => cartTotal(items, defaultOptions),
        { name: 'RangeError' }
      );
    });

    it('throws RangeError when quantity is a non-integer float (e.g. 1.5)', () => {
      const items = [{ name: 'Sản phẩm lỗi', price: 50000, qty: 1.5 }];
      assert.throws(
        () => cartTotal(items, defaultOptions),
        { name: 'RangeError' }
      );
    });

    it('throws RangeError when quantity is not a valid number (e.g. string or NaN)', () => {
      const items = [{ name: 'Sản phẩm lỗi', price: 50000, qty: '2' }];
      assert.throws(
        () => cartTotal(items, defaultOptions),
        { name: 'RangeError' }
      );
    });
  });

  describe('price validation', () => {
    it('throws RangeError when price is negative', () => {
      const items = [{ name: 'Sản phẩm lỗi', price: -50000, qty: 1 }];
      assert.throws(
        () => cartTotal(items, defaultOptions),
        { name: 'RangeError' }
      );
    });

    it('allows price of 0 (e.g. free promotional gift)', () => {
      const items = [
        { name: 'Hàng mua', price: 100000, qty: 1 },
        { name: 'Quà tặng kèm', price: 0, qty: 1 },
      ];
      // subtotal = 100000
      // vat = 8000
      // shipping = 30000
      // total = 138000
      assert.strictEqual(cartTotal(items, defaultOptions), 138000);
    });
  });

  describe('rounding to the whole đồng', () => {
    it('rounds total correctly to nearest whole đồng using Math.round', () => {
      const items = [{ name: 'Mặt hàng lẻ', price: 12345, qty: 1 }];
      const options = { vatRate: 0.0825, freeShipFrom: 500000, shipFee: 15000 };
      // subtotal = 12345
      // vat = 12345 * 0.0825 = 1018.4625
      // shipping = 15000
      // total = 12345 + 1018.4625 + 15000 = 28363.4625 -> 28363
      const result = cartTotal(items, options);
      assert.strictEqual(result, 28363);
      assert.strictEqual(Number.isInteger(result), true);
    });
  });
});
