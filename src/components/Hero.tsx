"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Wand2, Star, Zap, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAppwriteAccount } from "@/lib/appwrite";
import { useToast } from "@/components/ui/use-toast";

export default function Hero() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const account = getAppwriteAccount();
        const currentUser = await account.get();
        setUser(currentUser);

        const hasLabel = (currentUser as any).labels?.includes('premium');
        const hasPref = (currentUser as any).prefs?.plan === 'premium';
        
        if (hasLabel || hasPref) {
          setIsPremium(true);
        }
      } catch (e) {
        setUser(null);
      }
    };
    checkUser();
  }, []);

  const handleClaimPremium = async () => {
    setLoading(true);
    try {
      const account = getAppwriteAccount();
      
      // 1. Direct Auth Check
      try {
        await account.get(); 
      } catch (e) {
        router.push('/auth');
        return; 
      }

      // 2. Calculate Expiry (1 Month from today)
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      const dateString = expiryDate.toLocaleDateString('en-US', { 
        day: 'numeric', month: 'long', year: 'numeric' 
      });

      // 3. Activate Premium
      await account.updatePrefs({ 
        plan: 'premium', 
        expiry: expiryDate.toISOString() 
      });

      setIsPremium(true); // Hide button instantly

      toast({
        title: "🎉 Congratulations! Premium Activated",
        description: `Your free membership is active until ${dateString}.`,
        duration: 6000,
        className: "bg-green-600 text-white border-none"
      });

      setTimeout(() => window.location.reload(), 2000);

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please refresh and try again."
      });
      setLoading(false);
    }
  };

  return (
    <section className="relative pt-40 pb-20 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
      </div>

      <div className="container mx-auto px-4 text-center">
        {/* Trust Badge (Static & Professional) */}
        <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full px-4 py-1.5 mb-8 shadow-sm">
          <div className="flex -space-x-2">
            {[1,2,3,4].map((i) => (
              <Avatar key={i} className="border-2 border-white w-6 h-6">
                <AvatarFallback className="bg-slate-200 text-[9px]">U{i}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Trusted by 12,000+ creators</span>
          <div className="flex gap-0.5"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /></div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
          Transform Your Prompts Into <br />
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Professional AI Instructions</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Stop getting average results. Our intelligent optimizer refines your inputs for ChatGPT, Claude, and Gemini to deliver production-ready results.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          {/* Main Action Button */}
          <Button 
            size="lg" 
            className="h-12 px-8 text-lg bg-gray-900 text-white hover:bg-gray-800 shadow-xl" 
            onClick={() => document.getElementById('optimizer')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Start Optimizing Free <Wand2 className="ml-2 h-5 w-5" />
          </Button>

          {/* Claim Button - ONLY SHOWS IF NOT PREMIUM */}
          {!isPremium && (
            <Button 
              size="lg" 
              variant="outline" 
              className="h-12 px-8 text-lg bg-white/50 backdrop-blur-sm group hover:border-yellow-400 hover:bg-yellow-50/50"
              onClick={handleClaimPremium}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Check Auth...</>
              ) : (
                <>Claim Free Premium <Zap className="ml-2 h-4 w-4 text-yellow-500 fill-yellow-500 group-hover:scale-110 transition-transform" /></>
              )}
            </Button>
          )}
        </div>

        {/* Logos */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-10">
          <p className="text-sm font-medium text-gray-400 mb-6 uppercase tracking-wider">Trusted by teams at innovative companies</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale font-bold text-xl text-gray-600">
            <span>ZAPIER</span><span>NOTION</span><span>LINEAR</span><span>RAYCAST</span><span>VERCEL</span>
          </div>
        </div>
      </div>
    </section>
  );
}
