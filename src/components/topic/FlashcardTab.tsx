"use client";

import { Flashcard } from "@/types";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db, signInGuest } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { RefreshCcw, CheckCircle2, Frown, Meh, Smile, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

interface SM2Data {
  ef: number;
  interval: number;
  repetition: number;
  nextReviewDate: number; // timestamp
}

export default function FlashcardTab({ flashcards, topicTitle }: { flashcards: Flashcard[], topicTitle: string }) {
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Load SM-2 progress from Firebase
  useEffect(() => {
    async function loadDeck() {
      setLoading(true);
      const user = await signInGuest();
      if (!user) {
        setDeck([...flashcards]);
        setLoading(false);
        return;
      }
      setUserId(user.uid);
      
      try {
        const docRef = doc(db, "sm2_progress", user.uid);
        const docSnap = await getDoc(docRef);
        const progress: Record<string, SM2Data> = docSnap.exists() ? docSnap.data().cards || {} : {};

        const now = Date.now();
        // Filter deck: only show cards that are due for review (or never reviewed)
        const dueCards = flashcards.filter(card => {
          const cardData = progress[card.id];
          if (!cardData) return true; // never reviewed
          return cardData.nextReviewDate <= now; // due
        });

        // Sort by how overdue they are (oldest nextReviewDate first)
        dueCards.sort((a, b) => {
          const dateA = progress[a.id]?.nextReviewDate || 0;
          const dateB = progress[b.id]?.nextReviewDate || 0;
          return dateA - dateB;
        });

        setDeck(dueCards);
        if (dueCards.length === 0) setFinished(true);
      } catch (err) {
        console.error("Firebase error", err);
        setDeck([...flashcards]);
      }
      setLoading(false);
    }
    loadDeck();
  }, [flashcards]);

  const handleScore = async (quality: number) => {
    // quality: 0 (Again), 3 (Hard), 4 (Good), 5 (Easy)
    setIsFlipped(false);
    
    setTimeout(async () => {
      // Calculate SM-2
      if (userId && deck[currentIndex]) {
        try {
          const cardId = deck[currentIndex].id;
          const docRef = doc(db, "sm2_progress", userId);
          const docSnap = await getDoc(docRef);
          const data = docSnap.exists() ? docSnap.data() : { cards: {} };
          
          let { ef, interval, repetition }: SM2Data = data.cards[cardId] || { ef: 2.5, interval: 0, repetition: 0, nextReviewDate: 0 };

          // SuperMemo-2 Algorithm
          if (quality < 3) {
            repetition = 0;
            interval = 1;
          } else {
            if (repetition === 0) interval = 1;
            else if (repetition === 1) interval = 6;
            else interval = Math.round(interval * ef);
            repetition += 1;
          }

          ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
          if (ef < 1.3) ef = 1.3;

          // Calculate next review in ms
          // Instead of actual days, let's use minutes for testing/demo purposes if needed? 
          // For real use, 1 interval = 1 day (24 * 60 * 60 * 1000)
          const nextReviewDate = Date.now() + (interval * 24 * 60 * 60 * 1000);

          data.cards[cardId] = { ef, interval, repetition, nextReviewDate };
          await setDoc(docRef, data, { merge: true });
        } catch (error) {
          console.error("Error updating SM-2 score", error);
        }
      }

      if (currentIndex < deck.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setFinished(true);
      }
    }, 150);
  };

  const resetDeck = () => {
    // In a real Spaced Repetition app, you don't reset unless you want to study ahead.
    // We'll just reset the local state array for them to re-review if they want.
    setCurrentIndex(0);
    setFinished(false);
    setIsFlipped(false);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><RefreshCcw className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  if (finished || deck.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">You're all caught up!</h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-md">
          There are no cards due for review right now. Come back tomorrow!
        </p>
        <button
          onClick={() => {
            // Force review all cards just for practice
            setDeck([...flashcards]);
            resetDeck();
          }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-transform active:scale-95"
        >
          <RefreshCcw className="w-5 h-5" /> Study Custom Session Anyway
        </button>
      </div>
    );
  }

  const currentCard = deck[currentIndex];

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto py-10">
      <div className="w-full flex justify-between items-center mb-6 text-sm font-medium text-gray-500 dark:text-gray-400">
        <span>{topicTitle}</span>
        <span>Card {currentIndex + 1} of {deck.length}</span>
      </div>

      <div className="relative w-full aspect-[4/3] max-w-2xl perspective-1000">
        <motion.div
          className="w-full h-full relative preserve-3d cursor-pointer"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-snug">
              {currentCard.front}
            </h3>
            <p className="absolute bottom-6 text-sm text-gray-400 font-medium tracking-widest uppercase">Click to flip</p>
          </div>

          {/* Back */}
          <div 
            className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-10 bg-blue-50 dark:bg-blue-900/20 rounded-3xl shadow-xl border border-blue-200 dark:border-blue-900/50 text-center"
            style={{ transform: "rotateY(180deg)" }}
          >
            <div className="text-xl text-blue-900 dark:text-blue-100 leading-relaxed font-medium">
              {currentCard.back}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Constraints & Controls */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 w-full max-w-2xl px-4"
          >
            <button
              onClick={(e) => { e.stopPropagation(); handleScore(0); }}
              className="flex flex-col items-center py-3 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 rounded-2xl font-bold transition-all active:scale-95"
            >
              <Frown className="w-5 h-5 mb-1" /> Again
              <span className="text-xs font-normal opacity-80">&lt; 1d</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleScore(3); }}
              className="flex flex-col items-center py-3 bg-orange-100 hover:bg-orange-200 text-orange-700 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 dark:text-orange-300 rounded-2xl font-bold transition-all active:scale-95"
            >
              <Meh className="w-5 h-5 mb-1" /> Hard
              <span className="text-xs font-normal opacity-80">1.2d</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleScore(4); }}
              className="flex flex-col items-center py-3 bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300 rounded-2xl font-bold transition-all active:scale-95"
            >
              <Smile className="w-5 h-5 mb-1" /> Good
              <span className="text-xs font-normal opacity-80">2.5d</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleScore(5); }}
              className="flex flex-col items-center py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 rounded-2xl font-bold transition-all active:scale-95"
            >
              <Sparkles className="w-5 h-5 mb-1" /> Easy
              <span className="text-xs font-normal opacity-80">4d</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


