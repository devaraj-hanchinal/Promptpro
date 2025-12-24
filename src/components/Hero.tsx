"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { getAppwriteAccount } from "@/lib/appwrite";
import PromoCodeInput from "@/components/PromoCodeInput";

export default function Hero() {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const account = getAppwriteAccount();
        const currentUser = await account.get();
        
        const hasLabel = (currentUser as any).labels?.includes('premium');
        const hasPref = (currentUser as any).prefs?.plan === 'premium';
        
        if (hasLabel || hasPref) setIsPremium(true);
      } catch (e) {
        // User not logged in
      }
    };
    checkUser();
  }, []);

  return (
    <section className="relative pt-40 pb-10 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
      </div>

      <div className="container mx-auto px-4 text-center">
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
          Transform Your Prompts Into <br />
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Professional AI Instructions</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Stop getting average results. Our intelligent optimizer refines your inputs for ChatGPT, Claude, and Gemini to deliver production-ready results.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Button 
            size="lg" 
            className="h-12 px-8 text-lg bg-gray-900 text-white hover:bg-gray-800 shadow-xl" 
            onClick={() => document.getElementById('optimizer')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Start Optimizing Free <Wand2 className="ml-2 h-5 w-5" />
          </Button>

          {/* Promo Code Input - Only show if not premium */}
          {!isPremium && <PromoCodeInput />}
        </div>
      </div>
    </section>
  );
}
