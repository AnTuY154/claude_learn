export const fruits = [
  { name: "Táo", price: 100_000, currency: "VND", unit: "kg", category: "fruit" },
  { name: "Lê", price: 50_000, currency: "VND", unit: "kg", category: "fruit" },
];

export const flowers = [
  { name: "Hoa Lan", price: 20_000, currency: "VND", unit: "bông", category: "flower" },
  { name: "Hoa hồng", price: 7_000, currency: "VND", unit: "bông", category: "flower" },
];

export const electronics = [
  { name: "iPhone 16 128GB", price: 19_990_000, currency: "VND", unit: "cái", category: "electronics" },
  { name: "Samsung Galaxy S25 256GB", price: 20_990_000, currency: "VND", unit: "cái", category: "electronics" },
  { name: "MacBook Air M4 13-inch", price: 26_990_000, currency: "VND", unit: "cái", category: "electronics" },
  { name: "Sony WH-1000XM5", price: 7_490_000, currency: "VND", unit: "cái", category: "electronics" },
  { name: "Logitech MX Master 3S", price: 2_490_000, currency: "VND", unit: "cái", category: "electronics" },
];

export const products = [...fruits, ...flowers, ...electronics];

export function calculate(a: number, operator: string, b: number) {
  if (![a, b].every(Number.isFinite)) throw new Error("Toán hạng không hợp lệ");
  if (operator === "/" && b === 0) throw new Error("Không thể chia cho 0");
  const operations: Record<string, () => number> = {
    "+": () => a + b,
    "-": () => a - b,
    "*": () => a * b,
    "/": () => a / b,
    "**": () => a ** b,
  };
  if (!operations[operator]) throw new Error("Phép tính không được hỗ trợ");
  const result = operations[operator]();
  if (!Number.isFinite(result)) throw new Error("Kết quả không hợp lệ");
  return String(result);
}

export function searchProducts(query: string, maxPrice?: number) {
  const words = query.toLocaleLowerCase("vi").trim().split(/\s+/).filter(Boolean);
  return products.filter(
    (product) =>
      words.every((word) => product.name.toLocaleLowerCase("vi").includes(word)) &&
      (maxPrice === undefined || product.price <= maxPrice),
  );
}
