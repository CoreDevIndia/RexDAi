"use client";

import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";

interface AIResponseCardProps {
  title: string;
  provider: string;
  content: string;
  isLoading: boolean;
  error?: string | null;
}

export function AIResponseCard({
  title,
  provider,
  content,
  isLoading,
  error,
}: AIResponseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full min-h-[300px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{provider}</p>
        </div>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
        {error && <AlertCircle className="w-4 h-4 text-red-500" />}
      </div>

      <div className="p-5 flex-1 overflow-auto prose prose-sm dark:prose-invert max-w-none">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-full" />
            <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-5/6" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/10 p-3 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            <ReactMarkdown>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
