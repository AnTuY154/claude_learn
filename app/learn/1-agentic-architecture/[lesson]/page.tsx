import { redirect } from "next/navigation";

export default async function LegacyLesson({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson } = await params;
  redirect(lesson.startsWith("1-1-") ? "/lesson1" : "/lesson2");
}
