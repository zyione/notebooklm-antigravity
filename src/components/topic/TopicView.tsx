"use client";

import { Topic } from "@/types";
import { useState } from "react";
import ReviewerTab from "./ReviewerTab";
import LessonsTab from "./LessonsTab";
import QuizTab from "./QuizTab";
import FlashcardTab from "./FlashcardTab";

export default function TopicView({ topic }: { topic: Topic }) {
  const [activeTab, setActiveTab] = useState<'reviewer' | 'lessons' | 'quiz' | 'flashcards'>('reviewer');

  const tabs = [
    { id: 'reviewer', label: 'Reviewer' },
    { id: 'lessons', label: 'Lessons' },
    { id: 'quiz', label: 'Quiz' },
    { id: 'flashcards', label: 'Flashcards' },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-3rem)]">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">{topic.title}</h1>
        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">{topic.reviewer.summary}</p>
      </header>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-6 flex-1 overflow-y-auto pr-2 pb-12">
        {activeTab === 'reviewer' && <ReviewerTab content={topic.reviewer} topicId={topic.id} />}
        {activeTab === 'lessons' && <LessonsTab lessons={topic.lessons} />}
        {activeTab === 'quiz' && <QuizTab quizzes={topic.quizzes} topicId={topic.id} />}
        {activeTab === 'flashcards' && <FlashcardTab flashcards={topic.flashcards} topicTitle={topic.title} />}
      </div>
    </div>
  );
}
