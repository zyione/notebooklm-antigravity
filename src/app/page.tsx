import { getAllTopics } from '@/data/merger';
import Link from 'next/link';

export default function Home() {
  const topics = getAllTopics();
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
        Welcome to SecReview
      </h1>
      <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
        Master Information Security and Secure Web Development through interactive lessons, quizzes, and spaced-repetition flashcards.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 max-w-4xl w-full">
        {topics.map(t => (
          <Link 
            key={t.id} 
            href={`/topic/${t.id}`}
            className="group block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all text-left"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">{t.title}</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {t.reviewer.summary}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
