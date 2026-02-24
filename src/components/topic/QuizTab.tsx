"use client";

import { QuizQuestion } from "@/types";
import { useState, useMemo } from "react";
import { CheckCircle2, XCircle, RefreshCcw, FileText } from "lucide-react";
import { cn } from "@/lib/cn";

export default function QuizTab({ quizzes, topicId }: { quizzes: QuizQuestion[], topicId: string }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [incorrectIndices, setIncorrectIndices] = useState<number[]>([]);
  
  // Sort order applied on Retake
  const [order, setOrder] = useState<number[]>(() => Array.from({ length: quizzes.length }, (_, i) => i));

  const handleSelect = (idx: number, option: string) => {
    if (examSubmitted) return;
    setAnswers(prev => ({ ...prev, [idx]: option }));
  };

  const handleIdentify = (idx: number, value: string) => {
    if (examSubmitted) return;
    setAnswers(prev => ({ ...prev, [idx]: value }));
  };

  const submitExam = () => {
    if (examSubmitted) return;
    
    const incorrect: number[] = [];
    order.forEach((idx) => {
      const q = quizzes[idx];
      const ans = answers[idx] || "";
      const isCorrect = ans.toLowerCase().trim() === q.answer.toLowerCase().trim() ||
                        (q.type === 'multiple_choice' && ans.startsWith(q.answer));
      if (!isCorrect) {
        incorrect.push(idx);
      }
    });

    setIncorrectIndices(incorrect);
    setExamSubmitted(true);
  };

  const retakeExam = (prioritizeWeak: boolean) => {
    setExamSubmitted(false);
    setAnswers({});
    
    if (prioritizeWeak && incorrectIndices.length > 0) {
      const correctIndices = order.filter(i => !incorrectIndices.includes(i));
      setOrder([...incorrectIndices, ...correctIndices]);
    } else if (!prioritizeWeak) {
      // Reset strictly to normal
      setOrder(Array.from({ length: quizzes.length }, (_, i) => i));
    }
  };

  if (quizzes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
        <FileText className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600" />
        <p>No questions available for this topic yet.</p>
      </div>
    );
  }

  const score = quizzes.length - incorrectIndices.length;

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-10 sm:px-4">
      
      {examSubmitted && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm text-center mb-10 animate-in fade-in zoom-in-95">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Exam Finished</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 font-medium">
            You scored <span className={cn("font-bold", score / quizzes.length >= 0.7 ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-500")}>
              {score} out of {quizzes.length}
            </span> 
            {score / quizzes.length >= 0.7 ? " 🎉" : " 📚"}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => retakeExam(false)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors"
            >
              <RefreshCcw className="w-5 h-5" /> Retake Normal
            </button>
            {incorrectIndices.length > 0 && (
              <button 
                onClick={() => retakeExam(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors active:scale-95"
              >
                <RefreshCcw className="w-5 h-5" /> Retake (Weak First)
              </button>
            )}
          </div>
        </div>
      )}

      {order.map((idx, displayIndex) => {
        const q = quizzes[idx];
        const isCorrect = examSubmitted && !incorrectIndices.includes(idx);
        
        return (
          <div key={`quiz-q-${idx}`} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden">
            {/* Conditional Status Banner along the left edge when submitted */}
            {examSubmitted && (
              <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", isCorrect ? "bg-green-500" : "bg-red-500")} />
            )}

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <span className="text-gray-400 dark:text-gray-500 mr-2 text-sm">{displayIndex + 1}.</span>
              {q.question}
            </h3>

            {(q.type === 'multiple_choice' || q.type === 'true_false') && q.options && (
              <div className="flex flex-col space-y-2">
                {q.options.map((opt, i) => {
                  const isSelected = answers[idx] === opt;
                  
                  let optClass = "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";
                  if (isSelected && !examSubmitted) optClass = "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 ring-1 ring-blue-500";
                  
                  if (examSubmitted) {
                    const optionMatchesAnswer = opt.startsWith(q.answer) || opt.toLowerCase() === q.answer.toLowerCase();
                    if (optionMatchesAnswer) {
                      optClass = "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200 ring-2 ring-green-500";
                    } else if (isSelected && !optionMatchesAnswer) {
                      optClass = "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 ring-1 ring-red-500";
                    } else {
                      optClass = "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(idx, opt)}
                      disabled={examSubmitted}
                      className={cn(
                        "text-left px-4 py-3 rounded-xl border transition-all duration-200",
                        optClass,
                        !examSubmitted && "cursor-pointer active:scale-[0.99]"
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
                  onChange={(e) => handleIdentify(idx, e.target.value)}
                  disabled={examSubmitted}
                  placeholder="Type your answer here..."
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border outline-none transition-all dark:bg-gray-800 dark:text-white",
                    examSubmitted 
                      ? isCorrect 
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100" 
                        : "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100"
                      : "border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  )}
                />
              </div>
            )}

            {/* Post-submit Feedback */}
            {examSubmitted && (
              <div className="mt-5 animate-in fade-in slide-in-from-top-2">
                {isCorrect ? (
                  <span className="flex items-center text-green-600 dark:text-green-400 font-medium tracking-wide text-sm uppercase"><CheckCircle2 className="w-4 h-4 mr-1.5"/> Correct</span>
                ) : (
                  <div className="mt-3 text-sm text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl border border-red-100 dark:border-red-900/30 flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800 dark:text-red-300 mb-1">Incorrect</p>
                      <p>The correct answer is: <span className="font-bold">{q.answer}</span></p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Footer Submit Action */}
      {!examSubmitted && quizzes.length > 0 && (
        <div className="sticky bottom-4 left-0 right-0 z-10 flex justify-center mt-10">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 inline-block w-full sm:w-auto">
            <button
              onClick={submitExam}
              className="w-full sm:w-auto px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-blue-600/30 shadow-lg cursor-pointer transition-transform active:scale-95"
            >
              Submit Exam
            </button>
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
              Make sure you've answered all {quizzes.length} questions before submitting.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
