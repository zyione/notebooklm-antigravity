"use client";

import { useState, useEffect } from "react";
import { Check, StickyNote } from "lucide-react";
import { cn } from "@/lib/cn";
import { db, auth, signInGuest } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface QuestionWrapperProps {
  id: string; // unique ID for this question/recall item across the app
  children: React.ReactNode;
}

export default function QuestionStateWrapper({ id, children }: QuestionWrapperProps) {
  const [checked, setChecked] = useState(false);
  const [note, setNote] = useState("");
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Load auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        const guest = await signInGuest();
        if (guest) setUserId(guest.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore for changes
  useEffect(() => {
    if (!userId) return;
    const docRef = doc(db, "question_states", userId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()[id] || {};
        setChecked(!!data.checked);
        setNote(data.note || "");
      }
    });

    return () => unsubscribe();
  }, [userId, id]);

  const toggleCheck = async () => {
    const newState = !checked;
    setChecked(newState);
    
    if (userId) {
      const docRef = doc(db, "question_states", userId);
      await setDoc(docRef, {
        [id]: { checked: newState, note }
      }, { merge: true });
    }
  };

  const saveNote = async (newNote: string) => {
    setNote(newNote);
    
    if (userId) {
      const docRef = doc(db, "question_states", userId);
      await setDoc(docRef, {
        [id]: { checked, note: newNote }
      }, { merge: true });
    }
  };

  return (
    <div className="relative group">
      {/* Interactive Toolbar - inline on mobile, absolute on desktop */}
      <div className="flex flex-row gap-2 mb-2 md:mb-0 md:absolute md:-left-12 md:top-2 md:flex-col md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button
          onClick={toggleCheck}
          className={cn(
            "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors",
            checked 
              ? "bg-green-500 border-green-500 text-white" 
              : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-400 bg-white dark:bg-gray-800"
          )}
          title={checked ? "Mark as unchecked" : "Mark as checked"}
        >
          {checked && <Check className="w-5 h-5" />}
        </button>
        <button
          onClick={() => setIsNoteOpen(!isNoteOpen)}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm",
            note && !isNoteOpen ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50"
          )}
          title="Personal Notes"
        >
          <StickyNote className="w-4 h-4" />
        </button>
      </div>

      <div className={cn("transition-opacity", checked ? "opacity-60" : "opacity-100")}>
        {children}
      </div>

      {isNoteOpen && (
        <div className="mt-4 p-4 bg-amber-50/50 dark:bg-amber-900/10 border-l-4 border-amber-300 dark:border-amber-700 rounded-r-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-semibold text-sm">
              <StickyNote className="w-4 h-4" /> Personal Notes
            </div>
            {note && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPreviewing(false)}
                  className={cn("text-xs px-2 py-1 rounded", !isPreviewing ? "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100" : "text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50")}
                >
                  Edit
                </button>
                <button
                  onClick={() => setIsPreviewing(true)}
                  className={cn("text-xs px-2 py-1 rounded", isPreviewing ? "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100" : "text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50")}
                >
                  Preview
                </button>
              </div>
            )}
          </div>
          
          {isPreviewing && note ? (
            <div className="prose prose-sm prose-amber dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{note}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={note}
              onChange={(e) => saveNote(e.target.value)}
              placeholder="Add your personal notes to remember this... (Markdown supported)"
              className="w-full bg-transparent border-0 ring-0 focus:ring-0 resize-none min-h-[80px] text-sm text-gray-700 dark:text-gray-300 outline-none"
            />
          )}
        </div>
      )}
    </div>
  );
}
