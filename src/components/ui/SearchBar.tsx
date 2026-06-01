"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Send } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input whenever loading finishes
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
      setQuery("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full max-w-3xl mx-auto group"
    >
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything across multiple AIs..."
          className="w-full pl-12 pr-14 py-4 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-all text-lg shadow-sm group-hover:shadow-md"
          disabled={isLoading}
          autoFocus
        />
        <Search className="absolute left-4 w-6 h-6 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 text-white rounded-xl transition-all"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-500">
        Press Enter to send your question to all models.
      </p>
    </form>
  );
}
