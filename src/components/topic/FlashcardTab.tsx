"use client";

import { Flashcard } from "@/types";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db, signInGuest } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { RefreshCcw, ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";

export default function FlashcardTab({ flashcards, topicTitle }: { flashcards: Flashcard[], topicTitle: string }) {
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Load priority tracking from Firebase
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
        const docRef = doc(db, "flashcard_progress", user.uid);
        const docSnap = await getDoc(docRef);
        const progress = docSnap.exists() ? docSnap.data().weakAreas || {} : {};

        // Sort deck: prioritize IDs that are tracked as weak
        const sortedDeck = [...flashcards].sort((a, b) => {
          const scoreA = progress[a.id] || 0;
          const scoreB = progress[b.id] || 0;
          return scoreB - scoreA; // Higher score (weaker) goes first
        });

        setDeck(sortedDeck);
      } catch (err) {
        console.error("Firebase error", err);
        setDeck([...flashcards]);
      }
      setLoading(false);
    }
    loadDeck();
  }, [flashcards]);

  const handleScore = async (forgot: boolean) => {
    setIsFlipped(false);
    
    // Slight delay to allow flip animation to finish before changing card
    setTimeout(async () => {
      if (currentIndex < deck.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setFinished(true);
      }

      // Update Firebase
      if (userId) {
        try {
          const docRef = doc(db, "flashcard_progress", userId);
          const docSnap = await getDoc(docRef);
          const data = docSnap.exists() ? docSnap.data() : { weakAreas: {} };
          
          const currentScore = data.weakAreas[deck[currentIndex].id] || 0;
          // If forgot, increase weight (+2), if remembered, decrease weight (-1)
          const newScore = forgot ? currentScore + 2 : Math.max(0, currentScore - 1);
          
          data.weakAreas[deck[currentIndex].id] = newScore;
          
          await setDoc(docRef, data, { merge: true });
        } catch (error) {
          console.error("Error updating score", error);
        }
      }
    }, 150);
  };

  const resetDeck = () => {
    setCurrentIndex(0);
    setFinished(false);
    setIsFlipped(false);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><RefreshCcw className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Deck Finished!</h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-md">
          Great job! Weak areas have been recorded to prioritize them next time.
        </p>
        <button
          onClick={resetDeck}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-transform active:scale-95"
        >
          <RefreshCcw className="w-5 h-5" /> Review Again
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
            className="flex gap-4 mt-10 w-full max-w-md"
          >
            <button
              onClick={(e) => { e.stopPropagation(); handleScore(true); }}
              className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-2xl font-bold transition-all active:scale-95"
            >
              <ThumbsDown className="w-6 h-6" /> Not quite
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleScore(false); }}
              className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-2xl font-bold transition-all active:scale-95"
            >
              <ThumbsUp className="w-6 h-6" /> Got it!
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


