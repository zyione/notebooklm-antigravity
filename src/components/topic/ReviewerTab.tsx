"use client";

import { ReviewerContent } from "@/types";
import { useState } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";
import QuestionStateWrapper from "./QuestionStateWrapper";

export default function ReviewerTab({ content, topicId }: { content: ReviewerContent, topicId: string }) {
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'terms' | 'active-recall' | 'examples' | 'quick-review'>('summary');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [revealedRecallIds, setRevealedRecallIds] = useState<Set<number>>(new Set());

  const toggleRecall = (index: number) => {
    setRevealedRecallIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
      {/* Sub-tab Navigation: horizontal scroll on mobile, vertical sidebar on desktop */}
      <div className="md:w-64 flex-shrink-0">
        <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
          {[
            { id: 'summary', title: 'Summary' },
            { id: 'quick-review', title: 'Quick Review' },
            { id: 'terms', title: 'Terms' },
            { id: 'active-recall', title: 'Active Recall' },
            { id: 'examples', title: 'Examples' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md text-left transition-colors whitespace-nowrap flex-shrink-0",
                activeSubTab === tab.id 
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200"
                  : "text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              )}
            >
              {tab.title}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-[300px] md:min-h-[500px] bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        {activeSubTab === 'summary' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">Summary</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{content.summary}</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">Key Points</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                {content.keyPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeSubTab === 'quick-review' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-xl font-bold mb-4 dark:text-white text-center pb-2 border-b">Flash Review (Exam Prep)</h3>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900/50">
              <ul className="list-image-none space-y-3">
                {content.keyPoints.map((point, i) => (
                  <li key={i} className="flex gap-2 text-yellow-900 dark:text-yellow-200 font-medium">
                    <span className="text-xl leading-none">•</span> {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeSubTab === 'terms' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Important Terms</h3>
            {content.importantTerms.map((item, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedTerm(expandedTerm === item.term ? null : item.term)}
                  className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700/80 transition-colors"
                >
                  <span className="font-semibold dark:text-gray-200">{item.term}</span>
                  {expandedTerm === item.term ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedTerm === item.term && (
                  <div className="p-4 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
                    {item.definition}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeSubTab === 'active-recall' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 md:pl-8">
            <h3 className="text-xl font-bold mb-4 dark:text-white md:-ml-8">Active Recall</h3>
            <p className="text-sm text-gray-500 mb-4 md:-ml-8">Click &quot;Show Answer&quot; to verify your knowledge. Click the green checkmark to mark as done.</p>
            {content.activeRecallQuestions.map((qa, i) => {
              const isRevealed = revealedRecallIds.has(i);
              const questionId = `${topicId}-recall-${i}`;
              return (
                <QuestionStateWrapper key={questionId} id={questionId}>
                  <div className="p-5 border rounded-xl dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    <p className="font-medium text-lg mb-4 dark:text-white">{qa.question}</p>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => toggleRecall(i)}
                        className="self-start flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 rounded-md font-medium transition-colors text-sm"
                      >
                        {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {isRevealed ? 'Hide Answer' : 'Show Answer'}
                      </button>
                      {isRevealed && (
                        <div className="p-4 mt-2 bg-white dark:bg-gray-900 border border-green-200 dark:border-green-900/50 rounded-lg text-green-800 dark:text-green-200 animate-in fade-in slide-in-from-top-1">
                          {qa.answer}
                        </div>
                      )}
                    </div>
                  </div>
                </QuestionStateWrapper>
              );
            })}
          </div>
        )}

        {activeSubTab === 'examples' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Examples</h3>
            <div className="grid gap-4">
              {content.examples.map((example, i) => (
                <div key={i} className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg text-blue-900 dark:text-blue-100">
                  {example}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
