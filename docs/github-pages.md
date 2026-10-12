# GitHub Pages CI/CD

## URL
https://antuy154.github.io/claude_learn/

## Kích hoạt lần đầu
Repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.
Sau đó Actions → `CI & Deploy GitHub Pages` → `Run workflow`.
Mỗi lần merge/push lên `main`, workflow sẽ chạy `npm ci`, `npm test`, typecheck, static build và deploy.

## Giới hạn QUAN TRỌNG
GitHub Pages **không chạy Node.js/Next.js API routes**. Nội dung lý thuyết và Quiz Lesson 3 dùng được; phần Claude live (Lesson 1, Lesson 2, Lesson 3 Build Exercise, seasonal fruits) **không chạy** trên Pages.
Để bật bài thực hành Claude trực tuyến, cần host API ở dịch vụ có Node runtime (Vercel/Render/...) rồi thêm `NEXT_PUBLIC_API_BASE_URL` và cấu hình CORS hoặc reverse proxy. Không đưa Anthropic API key vào client/GitHub Pages.
Trong workflow, `app/api` và legacy dynamic redirect `app/learn` chỉ bị xóa trong CI checkout trước static build, không bị xóa khỏi repo.
Trang có thông báo rõ chế độ static để người học không nhầm rằng có API Claude.
