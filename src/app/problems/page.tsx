"use client";

import { getAllTopics } from "@/data/merger";
import { useState, useEffect } from "react";
import QuestionStateWrapper from "@/components/topic/QuestionStateWrapper";
import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

export default function GlobalProblemsPage() {
  const topics = getAllTopics();
  const [filter, setFilter] = useState<'all' | 'checked' | 'unchecked'>('all');
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  // Initialize all topics as expanded
  useEffect(() => {
    const initialExpanded = topics.reduce((acc, topic) => ({ ...acc, [topic.id]: true }), {});
    setExpandedTopics(initialExpanded);
  }, [topics]);

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 h-full flex flex-col">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">Global Problems Checklist</h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
            Track your progress across all Active Recall and Quiz questions in one place.
          </p>
        </div>
        
        {/* Filter */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg self-start">
          {(['all', 'unchecked', 'checked'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium capitalize transition-all",
                filter === f 
                  ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" 
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 pb-20 pr-4">
        {topics.map(topic => {
          const isExpanded = expandedTopics[topic.id];
          
          return (
            <div key={topic.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
              <button 
                onClick={() => toggleTopic(topic.id)}
                className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white text-left">{topic.title}</h2>
                {isExpanded ? <ChevronUp className="w-6 h-6 text-gray-500" /> : <ChevronDown className="w-6 h-6 text-gray-500" />}
              </button>

              {isExpanded && (
                <div className="p-6 space-y-8">
                  {/* Active Recall Section */}
                  {topic.reviewer.activeRecallQuestions.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-800 pb-2">Active Recall</h3>
                      <div className="space-y-4 pl-12 pr-4">
                        {topic.reviewer.activeRecallQuestions.map((qa, i) => {
                          const questionId = `${topic.id}-recall-${i}`;
                          return (
                            <QuestionStateWrapper key={questionId} id={questionId}>
                              <div className="p-4 border rounded-xl dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                <p className="font-medium mb-2 dark:text-gray-200">{qa.question}</p>
                                <details className="group">
                                  <summary className="cursor-pointer text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 list-none flex items-center gap-1">
                                    <Eye className="w-4 h-4 group-open:hidden" />
                                    <EyeOff className="w-4 h-4 hidden group-open:block" />
                                    <span className="group-open:hidden">Reveal Answer</span>
                                    <span className="hidden group-open:inline">Hide Answer</span>
                                  </summary>
                                  <div className="mt-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 text-sm">
                                    {qa.answer}
                                  </div>
                                </details>
                              </div>
                            </QuestionStateWrapper>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quizzes Section */}
                  {topic.quizzes.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-800 pb-2">Quizzes</h3>
                      <div className="space-y-4 pl-12 pr-4">
                        {topic.quizzes.map((q, i) => {
                          const questionId = `${topic.id}-quiz-${i}`;
                          return (
                            <QuestionStateWrapper key={questionId} id={questionId}>
                              <div className="p-4 border rounded-xl dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                <p className="font-medium mb-3 dark:text-gray-200">
                                  <span className="text-blue-500 mr-2 font-bold">Q.</span>
                                  {q.question}
                                </p>
                                {q.options && (
                                  <div className="grid sm:grid-cols-2 gap-2 mb-3">
                                    {q.options.map((opt, optIdx) => (
                                      <div key={optIdx} className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md text-gray-600 dark:text-gray-400">
                                        {opt}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="mt-2 text-sm bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-400 p-2 rounded-md border border-green-100 dark:border-green-900/30 inline-block font-medium">
                                  Ans: {q.answer}
                                </div>
                              </div>
                            </QuestionStateWrapper>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
