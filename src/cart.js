// Implement cartTotal here. See README.md for the specification.
export function cartTotal(items, options = {}) {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }

  const { vatRate = 0, freeShipFrom = 0, shipFee = 0 } = options;

  let subtotal = 0;
  for (const item of items) {
    if (typeof item.price !== 'number' || Number.isNaN(item.price) || item.price < 0) {
      throw new RangeError(`Invalid price: ${item.price}. Price must be a non-negative number.`);
    }

    if (!Number.isInteger(item.qty) || item.qty <= 0) {
      throw new RangeError(`Invalid quantity: ${item.qty}. Quantity must be a positive integer.`);
    }

    subtotal += item.price * item.qty;
  }

  const vat = subtotal * vatRate;
  const shipping = subtotal >= freeShipFrom ? 0 : shipFee;
  const total = subtotal + vat + shipping;

  return Math.round(total);
}
