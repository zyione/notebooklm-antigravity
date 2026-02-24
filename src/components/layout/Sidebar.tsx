import Link from 'next/link';
import { getRegularTopics, getMidtermTopics } from '@/data/merger';
import { BookOpen, ListTodo } from 'lucide-react';
import AuthButton from '../auth/AuthButton';
import CommandMenu from './CommandMenu';

export default function Sidebar() {
  const regularTopics = getRegularTopics();
  const midtermTopics = getMidtermTopics();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full border-r bg-white transition-transform md:translate-x-0 dark:border-gray-800 dark:bg-gray-900 flex flex-col">
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <Link href="/" className="mb-6 flex items-center space-x-2 px-2">
          <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-500" />
          <span className="text-xl font-bold dark:text-white">SecReview</span>
        </Link>
        <div className="mb-6 px-2">
          <CommandMenu />
        </div>
        <div className="space-y-1 mb-6">
          <Link
            href="/problems"
            className="flex items-center rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/50"
          >
            <ListTodo className="h-5 w-5" />
            <span className="ml-3 font-semibold">Global Problems</span>
          </Link>
        </div>
        
        <div className="space-y-1 mb-8">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Current Lessons
          </p>
          {regularTopics.map((topic) => (
            <Link
              key={topic.id}
              href={`/topic/${topic.id}`}
              className="flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              <span className="ml-3 text-sm font-medium">{topic.title}</span>
            </Link>
          ))}
        </div>

        <div className="space-y-1">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-500">
            Midterms Reviewer
          </p>
          {midtermTopics.map((topic) => (
            <Link
              key={topic.id}
              href={`/topic/${topic.id}`}
              className="group flex items-center rounded-lg p-2 text-gray-900 hover:bg-amber-50 dark:text-white dark:hover:bg-amber-900/30"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-sm">{topic.title}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <AuthButton />
      </div>
    </aside>
  );
}
