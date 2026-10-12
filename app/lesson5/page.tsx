import BilingualLesson from "@/app/components/BilingualLesson";

// Trang bài học thống nhất: Theory (VI/EN) → Summary → Quiz → Build Exercise.
// GitHub Pages export tĩnh; API key chỉ chạy trong scripts/live-labs.mjs phía Node.
export default function Lesson5Page() {
  return <BilingualLesson number={5} />;
}
