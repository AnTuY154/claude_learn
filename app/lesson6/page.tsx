import CourseLessonView from "@/app/components/CourseLessonView";
import { lessons } from "@/lib/agentic-course";

// Route tĩnh để Next.js export trên GitHub Pages mà không cần Node server.
export default function Lesson6Page() {
  return <CourseLessonView lesson={lessons[6]} />;
}
