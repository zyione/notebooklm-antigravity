"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { getAllTopics } from "@/data/merger";
import { useRouter } from "next/navigation";
import { Search, BookOpen, Quote } from "lucide-react";

export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const topics = getAllTopics();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400 rounded-lg transition-colors"
      >
        <span className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          <span>Search anything...</span>
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-white dark:bg-gray-900 px-1.5 py-0.5 font-mono text-[10px] font-medium text-gray-500 dark:text-gray-400 shadow-sm border border-gray-200 dark:border-gray-700">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Command.Dialog 
        open={open} 
        onOpenChange={setOpen} 
        label="Global Command Menu"
        className="fixed inset-0 z-50 flex items-start justify-center sm:pt-[20vh] bg-black/50 backdrop-blur-sm px-4"
      >
        <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in-95">
          <div className="flex items-center border-b border-gray-200 dark:border-gray-800 px-4">
            <Search className="w-5 h-5 text-gray-400" />
            <Command.Input 
              placeholder="Search topics, terms, lessons..." 
              className="w-full px-4 py-4 text-lg bg-transparent outline-none dark:text-white placeholder:text-gray-400"
            />
          </div>
          
          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-gray-500">No results found.</Command.Empty>
            
            <Command.Group heading="Topics" className="py-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {topics.map(topic => (
                <Command.Item 
                  key={topic.id}
                  onSelect={() => runCommand(() => router.push(`/topic/${topic.id}`))}
                  className="flex items-center gap-3 py-3 px-3 rounded-md cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 aria-selected:bg-blue-50 dark:aria-selected:bg-blue-900/30 transition-colors mt-1 group"
                >
                  <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-md group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                    <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold dark:text-gray-200 text-sm">{topic.title}</span>
                    <span className="text-gray-400 text-xs truncate max-w-[300px] sm:max-w-md mt-0.5">{topic.reviewer.summary}</span>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Important Terms" className="py-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-t border-gray-100 dark:border-gray-800 mt-2">
              {topics.flatMap(topic => 
                topic.reviewer.importantTerms.map(term => (
                  <Command.Item 
                    key={`${topic.id}-term-${term.term}`}
                    onSelect={() => runCommand(() => router.push(`/topic/${topic.id}`))}
                    className="flex items-center gap-3 py-3 px-3 rounded-md cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/30 aria-selected:bg-amber-50 dark:aria-selected:bg-amber-900/30 transition-colors mt-1 group"
                  >
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-md group-hover:bg-amber-200 dark:group-hover:bg-amber-800/50 transition-colors">
                      <Quote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-amber-900 dark:text-amber-200 text-sm">{term.term}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Found in {topic.title}</span>
                    </div>
                  </Command.Item>
                ))
              )}
            </Command.Group>
            
          </Command.List>
        </div>
      </Command.Dialog>
    </>
  );
}
