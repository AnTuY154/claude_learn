import assert from "node:assert/strict";
import test from "node:test";
import { calculate, flowers, fruits, searchProducts } from "./tools.ts";

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
