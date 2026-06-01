"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export function RexDLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      {/* Subtle background shape */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ 
          scale: [0.9, 1, 0.9],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-blue-600 rounded-xl shadow-md shadow-blue-500/20"
      />
      
      {/* Very subtle glow - reduced opacity and blur */}
      <motion.div
        animate={{ 
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-blue-400 rounded-xl blur-sm"
      />
      
      {/* Icon */}
      <Zap className="relative z-10 text-white fill-current w-1/2 h-1/2" />
    </div>
  );
}
