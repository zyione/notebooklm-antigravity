import { Lesson } from "@/types";

export default function LessonsTab({ lessons }: { lessons: Lesson[] }) {
  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {lessons.map((lesson, idx) => (
        <section key={idx} className="bg-white dark:bg-gray-900 p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white pb-2 border-b dark:border-gray-800">
            {lesson.title}
          </h2>
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed space-y-4 whitespace-pre-wrap">
            {lesson.content.split('\n\n').map((para, pIdx) => (
              <p key={pIdx}>
                {para}
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
