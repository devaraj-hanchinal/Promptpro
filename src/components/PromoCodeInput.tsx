"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Zap } from "lucide-react";
import { getAppwriteAccount } from "@/lib/appwrite";
import { useToast } from "@/components/ui/use-toast";

export default function PromoCodeInput() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleApplyCode = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    try {
      const account = getAppwriteAccount();
      
      // 1. Check if user is logged in
      try {
        await account.get();
      } catch (e) {
        router.push('/auth');
        return;
      }

      // 2. Validate Code
      if (code.toUpperCase() !== 'DA62') {
        throw new Error("Invalid promo code.");
      }

      // 3. Calculate 1-Month Expiry
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      const dateString = expiryDate.toLocaleDateString('en-US', { 
        day: 'numeric', month: 'long', year: 'numeric' 
      });

      // 4. Activate Premium
      await account.updatePrefs({ 
        plan: 'premium', 
        promo_code: 'DA62',
        expiry: expiryDate.toISOString() 
      });

      toast({
        title: "🎉 Promo Code Applied!",
        description: `1 Month free premium active until ${dateString}.`,
        className: "bg-green-600 text-white border-none",
        duration: 5000,
      });

      setCode('');
      // Refresh to update UI
      setTimeout(() => window.location.reload(), 2000);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not apply code. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input 
        type="text" 
        placeholder="Enter Promo Code" 
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="h-12 bg-white/50 backdrop-blur-sm"
      />
      <Button 
        size="lg"
        className="h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg transition-all hover:scale-105 active:scale-95 shrink-0"
        onClick={handleApplyCode}
        disabled={loading || !code.trim()}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>Apply <Zap className="ml-2 h-4 w-4 fill-yellow-400 text-yellow-400" /></>
        )}
      </Button>
    </div>
  );
}
