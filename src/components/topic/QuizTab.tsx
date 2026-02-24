"use client";

import { QuizQuestion } from "@/types";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

import QuestionStateWrapper from "./QuestionStateWrapper";

export default function QuizTab({ quizzes, topicId }: { quizzes: QuizQuestion[], topicId: string }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});

  const handleSelect = (idx: number, option: string) => {
    if (submitted[idx]) return;
    setAnswers(prev => ({ ...prev, [idx]: option }));
  };

  const checkAnswer = (idx: number) => {
    if (!answers[idx]) return;
    setSubmitted(prev => ({ ...prev, [idx]: true }));
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-10 pl-8">
      {quizzes.map((q, idx) => {
        const isSubmitted = submitted[idx];
        const isCorrect = isSubmitted && answers[idx]?.toLowerCase().trim() === q.answer.toLowerCase().trim();
        const questionId = `${topicId}-quiz-${idx}`;

        return (
          <QuestionStateWrapper key={questionId} id={questionId}>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <span className="text-blue-600 dark:text-blue-400 mr-2">Q{idx + 1}.</span>
                {q.question}
              </h3>

              {(q.type === 'multiple_choice' || q.type === 'true_false') && q.options && (
                <div className="flex flex-col space-y-2">
                  {q.options.map((opt, i) => {
                    const isSelected = answers[idx] === opt;
                    // If question is multiple choice, the option text might be "A) text" or just "text".
                    // the format from JSON is usually "A) The answer". The answer key might be "A" or the full text.
                    // We handle the check loosely when submitted.
                    
                    let optClass = "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";
                    if (isSelected) optClass = "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 ring-1 ring-blue-500";
                    
                    if (isSubmitted) {
                      const optionMatchesAnswer = opt.startsWith(q.answer) || opt.toLowerCase() === q.answer.toLowerCase();
                      if (optionMatchesAnswer) {
                        optClass = "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200 ring-1 ring-green-500";
                      } else if (isSelected) {
                        optClass = "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 ring-1 ring-red-500";
                      } else {
                        optClass = "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 opacity-50";
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleSelect(idx, opt)}
                        disabled={isSubmitted}
                        className={cn(
                          "text-left px-4 py-3 rounded-xl border transition-all duration-200",
                          optClass
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {q.type === 'identification' && (
                <div className="flex flex-col space-y-3">
                  <input
                    type="text"
                    value={answers[idx] || ''}
                    onChange={(e) => !isSubmitted && setAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                    disabled={isSubmitted}
                    placeholder="Type your answer here..."
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border outline-none transition-all dark:bg-gray-800 dark:text-white",
                      isSubmitted 
                        ? isCorrect 
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                          : "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    )}
                  />
                </div>
              )}

              <div className="mt-5 flex items-center justify-between">
                {!isSubmitted ? (
                  <button
                    onClick={() => checkAnswer(idx)}
                    disabled={!answers[idx]}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    Verify Answer
                  </button>
                ) : (
                  <div className="flex items-center gap-2 font-medium">
                    {isCorrect ? (
                      <span className="flex items-center text-green-600 dark:text-green-400"><CheckCircle2 className="w-5 h-5 mr-1"/> Correct!</span>
                    ) : (
                      <span className="flex items-center text-red-600 dark:text-red-400"><XCircle className="w-5 h-5 mr-1"/> Incorrect.</span>
                    )}
                  </div>
                )}
                
                {isSubmitted && !isCorrect && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg border dark:border-gray-700">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Answer:</span> {q.answer}
                  </div>
                )}
              </div>
            </div>
          </QuestionStateWrapper>
        );
      })}
    </div>
  );
}
