'use client';

import Link from 'next/link';
import { getRegularTopics, getMidtermTopics } from '@/data/merger';
import { BookOpen, ListTodo, X } from 'lucide-react';
import AuthButton from '../auth/AuthButton';
import CommandMenu from './CommandMenu';

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen = false, setIsOpen }: SidebarProps) {
  const regularTopics = getRegularTopics();
  const midtermTopics = getMidtermTopics();

  const handleClose = () => {
    if (setIsOpen) setIsOpen(false);
  };

  return (
    <aside 
      className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-white transition-transform dark:border-gray-800 dark:bg-gray-900 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
    >
      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
        {/* Mobile Close Button & Logo */}
        <div className="mb-4 flex items-center justify-between px-2 md:hidden">
          <Link href="/" className="flex items-center space-x-2" onClick={handleClose}>
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-500" />
            <span className="text-xl font-bold dark:text-white">SecReview</span>
          </Link>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop Logo */}
        <Link href="/" className="mb-6 hidden items-center space-x-2 px-2 md:flex">
          <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-500" />
          <span className="text-xl font-bold dark:text-white">SecReview</span>
        </Link>
        <div className="mb-6 px-2">
          <CommandMenu />
        </div>
        <div className="mb-6 space-y-1">
          <Link
            href="/problems"
            onClick={handleClose}
            className="flex items-center rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/50"
          >
            <ListTodo className="h-5 w-5" />
            <span className="ml-3 font-semibold">Global Problems</span>
          </Link>
        </div>
        
        <div className="mb-8 space-y-1">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Current Lessons
          </p>
          {regularTopics.map((topic) => (
            <Link
              key={topic.id}
              href={`/topic/${topic.id}`}
              onClick={handleClose}
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
              onClick={handleClose}
              className="group flex items-center rounded-lg p-2 text-gray-900 hover:bg-amber-50 dark:text-white dark:hover:bg-amber-900/30"
            >
              <div className="mr-2 h-1.5 w-1.5 rounded-full bg-amber-400 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-amber-500" />
              <span className="text-sm">{topic.title}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        <AuthButton />
      </div>
    </aside>
  );
}
