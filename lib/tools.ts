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

export function calculateOrderTotal(items: unknown) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Đơn hàng phải có ít nhất một sản phẩm");
  }

  const lines = items.map((item) => {
    if (!item || typeof item !== "object") throw new Error("Sản phẩm không hợp lệ");
    const { product_name, quantity } = item as Record<string, unknown>;
    const product = products.find(({ name }) => name === product_name);
    if (!product) throw new Error(`Sản phẩm không tồn tại: ${String(product_name ?? "")}`);
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(`Số lượng của ${product.name} phải là số nguyên dương`);
    }
    return {
      product_name: product.name,
      quantity,
      unit: product.unit,
      unit_price: product.price,
      line_total: product.price * quantity,
    };
  });

  const subtotal = lines.reduce((sum, line) => sum + line.line_total, 0);
  const apple_cover_fee = lines.some(({ product_name }) => product_name === "Táo") ? 10_000 : 0;
  return { items: lines, subtotal, apple_cover_fee, total: subtotal + apple_cover_fee, currency: "VND" };
}
