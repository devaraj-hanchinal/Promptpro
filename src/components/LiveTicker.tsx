"use client";

import { useEffect, useState } from "react";

const ACTIONS = [
  "Marketing prompt optimized",
  "Coding helper generated",
  "Email draft refined",
  "Blog post outline created",
  "SEO description optimized",
  "Midjourney prompt enhanced",
  "Business strategy refined",
  "Social media caption generated"
];

export default function LiveTicker() {
  const [text, setText] = useState(ACTIONS[0]);
  const [count, setCount] = useState(12403);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      // Randomly change the action text
      const randomAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
      setText(randomAction);
      
      // Fake increment the counter to look "live"
      setCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <div className="flex justify-center mt-6 mb-2 animate-in fade-in zoom-in duration-700">
      <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-xs text-gray-500 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">{count.toLocaleString()}</span> 
        <span className="hidden sm:inline">prompts optimized.</span>
        <span className="border-l border-gray-300 dark:border-gray-600 pl-2 ml-1 text-gray-400 italic">
          {text}...
        </span>
      </div>
    </div>
  );
}
