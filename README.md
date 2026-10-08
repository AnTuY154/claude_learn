# Claude Product Tools · Next.js PWA

PWA dùng Claude API với hai client tools: tính toán và tìm sản phẩm kèm giá.

```powershell
npm install
Copy-Item .env.example .env.local
# Điền ANTHROPIC_API_KEY trong .env.local
npm run dev
```

Mở `http://localhost:3001`. Catalog mẫu nằm trong `lib/tools.ts`.

```powershell
npm test
npm run build
npm start
```

Service worker chỉ tự đăng ký ở production. Chạy `npm run build` và `npm start`, sau đó dùng nút Install của trình duyệt để cài PWA.
