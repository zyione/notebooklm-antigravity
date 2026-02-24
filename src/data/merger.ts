import data1 from './learning-1.json';
import data2 from './learning-2.json';
import midtermsData from './midterms-reviewer.json';
import { Topic, Flashcard, QuizQuestion, Lesson, ReviewerContent } from '@/types';

function createSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const mergedTopics: Topic[] = [];
export const midtermTopics: Topic[] = [];

// Since there are 4 topics in both and they correspond roughly:
// 1. Introduction to Information Security & Secure Coding / Introduction to Information Security & SDLC
// 2. Security Principles for Secure Software Design / Security Principles & Secure Coding
// 3. Threat Modeling / Threat Modeling
// 4. Authentication and Authorization / Authentication & Authorization

const topicsCount = Math.min(data1.curriculum.topics.length, data2.topics.length);

for (let i = 0; i < topicsCount; i++) {
  const t1 = data1.curriculum.topics[i];
  const t2 = data2.topics[i];

  const title = t2.title; // Prefer t2's title
  const id = createSlug(title);

  // Merge Reviewer Content
  const reviewer: ReviewerContent = {
    summary: t2.reviewer.summary, // From 2
    keyPoints: Array.from(new Set([...t2.reviewer.keyPoints, ...t1.lesson.key_points_summary])),
    importantTerms: t2.reviewer.importantTerms,
    examples: Array.from(new Set([...t2.reviewer.examples, ...t1.lesson.examples])),
    activeRecallQuestions: t2.reviewer.activeRecallQuestions,
  };

  // Merge Lessons
  const lessons: Lesson[] = [...t2.lessons];
  // Add t1's lesson explanation and analogies as an intro lesson
  lessons.unshift({
    title: "Overview & Analogies",
    content: `${t1.lesson.explanation}\n\n**Analogies:**\n${t1.lesson.analogies.join('\n')}`
  });

  // Merge Quizzes
  const quizzes: QuizQuestion[] = [];
  // From 2 (Multiple choice usually)
  t2.quiz.forEach((q: any) => {
    quizzes.push({
      type: 'multiple_choice',
      question: q.question,
      options: q.options,
      answer: q.answer
    });
  });
  // From 1
  t1.quiz_questions.multiple_choice?.forEach((q: any) => {
    // avoid duplicates if question text is exactly same
    if (!quizzes.find(existing => existing.question === q.question)) {
      quizzes.push({
        type: 'multiple_choice',
        question: q.question,
        options: q.options,
        answer: q.answer
      });
    }
  });

  t1.quiz_questions.identification?.forEach((q: any) => {
    quizzes.push({
      type: 'identification',
      question: q.question,
      answer: q.answer
    });
  });

  t1.quiz_questions.true_or_false?.forEach((q: any) => {
    quizzes.push({
      type: 'true_false',
      question: q.question,
      options: ['True', 'False'],
      answer: q.answer
    });
  });

  // Merge Flashcards
  const flashcards: Flashcard[] = [];
  let fcIdCounter = 1;
  const addFlashcard = (fFront: string, fBack: string, diff?: string) => {
    if (!flashcards.find(existing => existing.front === fFront)) {
      flashcards.push({
        id: `${id}-fc-${fcIdCounter++}`,
        front: fFront,
        back: fBack,
        difficulty: diff || 'medium'
      });
    }
  };

  t2.flashcards.forEach((fc: any) => addFlashcard(fc.front, fc.back));
  t1.flashcards.forEach((fc: any) => addFlashcard(fc.front, fc.back, fc.difficulty));

  mergedTopics.push({
    id,
    title,
    reviewer,
    lessons,
    quizzes,
    flashcards
  });
}

// Process Midterms Data
midtermsData.topics.forEach((t: any) => {
  const title = t.title;
  const id = `midterm-${createSlug(title)}`;

  const reviewer: ReviewerContent = {
    summary: t.reviewer.summary,
    keyPoints: t.reviewer.keyPoints || [],
    importantTerms: t.reviewer.importantTerms || [],
    examples: t.reviewer.examples || [],
    activeRecallQuestions: t.reviewer.activeRecallQuestions || [],
  };

  const quizzes: QuizQuestion[] = [];
  t.quiz?.forEach((q: any) => {
    quizzes.push({
      type: q.options.length === 2 && q.options.includes("True") ? 'true_false' : 'multiple_choice',
      question: q.question,
      options: q.options,
      answer: q.answer
    });
  });

  const flashcards: Flashcard[] = [];
  let fcIdCounter = 1;
  t.flashcards?.forEach((fc: any) => {
    flashcards.push({
      id: `${id}-fc-${fcIdCounter++}`,
      front: fc.front,
      back: fc.back,
      difficulty: 'medium'
    });
  });

  midtermTopics.push({
    id,
    title,
    reviewer,
    lessons: t.lessons || [],
    quizzes,
    flashcards
  });
});


export function getAllTopics() {
  return [...mergedTopics, ...midtermTopics];
}

export function getRegularTopics() {
  return mergedTopics;
}

export function getMidtermTopics() {
  return midtermTopics;
}

export function getTopicById(id: string) {
  return getAllTopics().find(t => t.id === id);
}
