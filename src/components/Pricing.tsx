"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Zap, Loader2 } from "lucide-react";
import { getAppwriteAccount } from "@/lib/appwrite";
import { useToast } from "@/components/ui/use-toast";

export default function Pricing() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const account = getAppwriteAccount();
        const currentUser = await account.get();
        setUser(currentUser);

        // Check if already premium
        const hasLabel = (currentUser as any).labels?.includes('premium');
        const hasPref = (currentUser as any).prefs?.plan === 'premium';
        if (hasLabel || hasPref) setIsPremium(true);
      } catch (e) {
        setUser(null);
      }
    };
    checkUser();
  }, []);

  const activateFreePremium = async () => {
    setLoading(true);
    try {
      const account = getAppwriteAccount();
      // The Magic Line: Grants Premium via Preferences
      await account.updatePrefs({ plan: 'premium', joined_offer: 'true' });
      
      toast({
        title: "🎉 Premium Activated!",
        description: "You now have unlimited access until 2026!",
        duration: 5000,
      });

      // Refresh page to update UI
      setTimeout(() => window.location.reload(), 1500);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Activation Failed",
        description: "Please try again or contact support.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-violet-100/50 dark:bg-violet-900/10 rounded-full blur-3xl mix-blend-multiply" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/50 dark:bg-indigo-900/10 rounded-full blur-3xl mix-blend-multiply" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Join thousands of professionals optimizing their workflow today.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* FREE PLAN */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Starter</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">₹0</span>
              <span className="text-gray-500">/forever</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Perfect for trying out the power of AI optimization.</p>
            <Button variant="outline" className="w-full mb-8" asChild>
              <Link href={user ? "/" : "/auth"}>
                {user ? "Current Plan" : "Get Started Free"}
              </Link>
            </Button>
            <ul className="space-y-4">
              {['5 Optimizations per day', 'Basic optimization styles', 'General AI model support', 'Copy to clipboard', 'No account required'].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* PREMIUM PLAN (THE OFFER) */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-violet-600 shadow-xl relative transform scale-105">
            <div className="absolute top-0 right-0 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
              LIMITED OFFER
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              Pro <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            </h3>
            
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">FREE</span>
              <span className="text-lg text-gray-400 line-through decoration-red-500">₹99</span>
            </div>
            <p className="text-sm text-violet-600 font-medium mb-6">Valid until Jan 1st, 2026</p>

            {/* THE MAGIC BUTTON */}
            {user ? (
              <Button 
                className="w-full mb-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                onClick={activateFreePremium}
                disabled={loading || isPremium}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Activating...</>
                ) : isPremium ? (
                  "Plan Active ✅"
                ) : (
                  "Claim Free Premium Now"
                )}
              </Button>
            ) : (
              <Link href="/auth">
                <Button className="w-full mb-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                  Start Free Trial
                </Button>
              </Link>
            )}

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mb-6 border border-green-100 dark:border-green-900/30">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium text-center">
                🎁 Premium is FREE for a limited time! <br/>
                <span className="text-xs opacity-80 font-normal">No credit card required. Enjoy all features.</span>
              </p>
            </div>

            <ul className="space-y-4">
              {[
                'Unlimited prompt optimizations',
                'All optimization styles',
                'All AI model optimizations',
                'Priority processing',
                'Prompt history & favorites',
                'Advanced customization options',
                'Export prompts',
                'Early access to new features'
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <Check className="w-5 h-5 text-violet-600 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

        </div>
        
        <p className="text-center text-sm text-gray-500 mt-12">
          💳 No credit card required for free trial • Cancel anytime • 30-day money-back guarantee
        </p>
      </div>
    </section>
  );
}
