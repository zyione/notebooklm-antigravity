export interface ImportantTerm {
  term: string;
  definition: string;
}

export interface ActiveRecallQuestion {
  question: string;
  answer: string;
}

export interface ReviewerContent {
  summary: string;
  keyPoints: string[];
  importantTerms: ImportantTerm[];
  examples: string[];
  activeRecallQuestions: ActiveRecallQuestion[];
}

export interface Lesson {
  title: string;
  content: string;
}

export interface QuizQuestion {
  type: "multiple_choice" | "identification" | "true_false";
  question: string;
  options?: string[];
  answer: string;
}

export interface Flashcard {
  id: string; // generated
  front: string;
  back: string;
  difficulty?: string;
}

export interface Topic {
  id: string; // generated slug
  title: string;
  reviewer: ReviewerContent;
  lessons: Lesson[];
  quizzes: QuizQuestion[];
  flashcards: Flashcard[];
}
