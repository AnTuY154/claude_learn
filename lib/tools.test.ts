import assert from "node:assert/strict";
import test from "node:test";
import { calculate, calculateOrderTotal, flowers, fruits, searchProducts } from "./tools.ts";

test("calculates and searches products by price", () => {
  assert.equal(calculate(6, "*", 7), "42");
  assert.equal(searchProducts("sony", 8_000_000)[0]?.price, 7_490_000);
  assert.deepEqual(
    fruits.map(({ name, price, unit, category }) => ({ name, price, unit, category })),
    [
      { name: "Táo", price: 100_000, unit: "kg", category: "fruit" },
      { name: "Lê", price: 50_000, unit: "kg", category: "fruit" },
    ],
  );
  assert.deepEqual(
    flowers.map(({ name, price }) => ({ name, price })),
    [
      { name: "Hoa Lan", price: 20_000 },
      { name: "Hoa hồng", price: 7_000 },
    ],
  );
  assert.equal(searchProducts("hoa hồng")[0]?.category, "flower");
  assert.throws(() => calculate(1, "/", 0));
});

test("calculates an order and adds the apple cover fee once", () => {
  assert.deepEqual(calculateOrderTotal([{ product_name: "Táo", quantity: 2 }]), {
    items: [{ product_name: "Táo", quantity: 2, unit: "kg", unit_price: 100_000, line_total: 200_000 }],
    subtotal: 200_000,
    apple_cover_fee: 10_000,
    total: 210_000,
    currency: "VND",
  });
  assert.equal(calculateOrderTotal([
    { product_name: "Táo", quantity: 2 },
    { product_name: "Táo", quantity: 3 },
  ]).apple_cover_fee, 10_000);
});

test("does not add the apple cover fee to orders without apples", () => {
  const order = calculateOrderTotal([{ product_name: "Lê", quantity: 2 }]);
  assert.equal(order.apple_cover_fee, 0);
  assert.equal(order.total, 100_000);
});

test("rejects unknown products and invalid quantities", () => {
  assert.throws(() => calculateOrderTotal([{ product_name: "Cam", quantity: 1 }]), /không tồn tại/);
  assert.throws(() => calculateOrderTotal([{ product_name: "Táo", quantity: 0 }]), /số nguyên dương/);
  assert.throws(() => calculateOrderTotal([{ product_name: "Táo", quantity: 1.5 }]), /số nguyên dương/);
});
