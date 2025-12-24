"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { getAppwriteAccount } from "@/lib/appwrite";
import PromoCodeInput from "@/components/PromoCodeInput";

export default function Pricing() {
  const [user, setUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const account = getAppwriteAccount();
        const currentUser = await account.get();
        setUser(currentUser);

        const hasLabel = (currentUser as any).labels?.includes('premium');
        const hasPref = (currentUser as any).prefs?.plan === 'premium';
        if (hasLabel || hasPref) setIsPremium(true);
      } catch (e) {
        setUser(null);
      }
    };
    checkUser();
  }, []);

  return (
    <section id="pricing" className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Starter</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">₹0</span>
              <span className="text-gray-500">/forever</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Perfect for trying out the power of AI optimization.</p>
            
            {/* FIX: Change button behavior based on login status */}
            <Button variant="outline" className="w-full mb-8" asChild>
              {user ? (
                <Link href="#optimizer">Start Optimizing</Link>
              ) : (
                <Link href="/auth">Get Started Free</Link>
              )}
            </Button>

            <ul className="space-y-4">
              {['5 Optimizations per day', 'Basic optimization styles', 'General AI model support'].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" /> {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* PREMIUM PLAN */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-violet-600 shadow-xl relative transform scale-105">
            <div className="absolute top-0 right-0 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">LIMITED OFFER</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              Pro <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            </h3>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">₹99</span>
              <span className="text-lg text-gray-500">/month</span>
            </div>
            <p className="text-sm text-violet-600 font-medium mb-6">Use code DA62 for 1 Month Free</p>

            {/* Replace old claim button with PromoCodeInput */}
            <div className="mb-8">
              {isPremium ? (
                 <Button className="w-full bg-green-600 hover:bg-green-700 text-white" disabled>
                    Plan Active ✅
                 </Button>
              ) : (
                 <PromoCodeInput />
              )}
            </div>

            <ul className="space-y-4">
              {['Unlimited optimizations', 'All AI models', 'Priority processing', 'Prompt history'].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <Check className="w-5 h-5 text-violet-600 flex-shrink-0" /> {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
