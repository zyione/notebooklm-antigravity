"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

export default function Shell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:hidden">
        <span className="text-xl font-bold dark:text-white">SecReview</span>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col md:pl-64">
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
