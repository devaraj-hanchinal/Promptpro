"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Copy, Check, RefreshCw, Eraser, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getAppwriteDatabases, getAppwriteAccount } from "@/lib/appwrite";
import { Query } from "appwrite"; 
import TrustBadge from "@/components/TrustBadge";      
import CompanyLogos from "@/components/CompanyLogos"; 
import PrivacyControl from "@/components/PrivacyControl"; 

// QUICK START TEMPLATES
const TEMPLATES = [
  "Write a SEO blog post about...",
  "Create a Python script to...",
  "Write a cold email to...",
  "Generate a Midjourney prompt for...",
  "Summarize this text..."
];

export default function PromptOptimizer() {
  const [prompt, setPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedModel, setSelectedModel] = useState('general');
  const [outputStyle, setOutputStyle] = useState('detailed');
   
  // USAGE STATE
  const [usageCount, setUsageCount] = useState(0);
  const [maxLimit, setMaxLimit] = useState(5);
  const [isPremium, setIsPremium] = useState(false);

  // PRIVACY STATE
  const [isIncognito, setIsIncognito] = useState(false); 

  const { toast } = useToast();

  // 1. FETCH USAGE ON LOAD
  useEffect(() => {
    const loadUsage = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      try {
        const account = getAppwriteAccount();
        const user = await account.get();
        
        // Check Premium
        const hasLabel = (user as any).labels?.includes('premium');
        const hasPref = (user as any).prefs?.plan === 'premium';
        if (hasLabel || hasPref) {
            setIsPremium(true);
            return; // No limits for premium
        }

        // Check DB Usage (Simulated for UI sync)
        const prefs = user.prefs || {};
        if (prefs.lastUsageDate === today) {
            setUsageCount(prefs.dailyCount || 0);
        } else {
            setUsageCount(0);
        }
      } catch (e) {
        // Guest User: Check LocalStorage
        const storage = localStorage.getItem('guest_usage');
        const data = storage ? JSON.parse(storage) : { date: today, count: 0 };
        if (data.date === today) {
            setUsageCount(data.count);
        } else {
            setUsageCount(0);
        }
      }
    };
    loadUsage();
  }, [isOptimizing]); 

  const handleCopy = async () => {
    await navigator.clipboard.writeText(optimizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Ready to use." });
  };

  const handleClear = () => {
    setPrompt('');
    setOptimizedPrompt('');
    setCopied(false);
  };

  // --- HANDLE CLEAR HISTORY ---
  const handleClearHistory = async () => {
    if (!confirm("Are you sure? This will delete your saved history.")) return;

    try {
        const databases = getAppwriteDatabases();
        
        // 1. List documents
        const result = await databases.listDocuments(
            'prompt-pro-db', 
            'history', 
            [Query.limit(100)]
        );

        // 2. Delete them
        const deletePromises = result.documents.map(doc => 
            databases.deleteDocument('prompt-pro-db', 'history', doc.$id)
        );

        await Promise.all(deletePromises);
        toast({ title: "History Cleared", description: "Your history has been wiped." });
    } catch (error) {
        console.error("Error clearing history:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not clear history." });
    }
  };

  const handleTemplateClick = (text: string) => {
    setPrompt(text);
  };

  // --- LOGIC ---
  const checkUsageLimit = async (user: any): Promise<boolean> => {
    if (isPremium) return true; 

    const today = new Date().toISOString().split('T')[0];
    const MAX_DAILY = 5;
   
    let currentCount = 0;

    if (!user) {
        // Guest
        const storage = localStorage.getItem('guest_usage');
        // FIX: Changed 'const' to 'let' here so we can reassign it
        let data = storage ? JSON.parse(storage) : { date: today, count: 0 };
        
        if (data.date !== today) {
            data = { date: today, count: 0 };
        }
        currentCount = data.count;

        if (currentCount >= MAX_DAILY) {
            triggerLimitToast();
            return false;
        }
    } else {
        // Free User
        const prefs = user.prefs || {};
        currentCount = (prefs.lastUsageDate === today) ? (prefs.dailyCount || 0) : 0;
        
        if (currentCount >= MAX_DAILY) {
            triggerLimitToast();
            return false;
        }
    }
    
    return true;
  };

  const triggerLimitToast = () => {
    toast({
        title: "Daily Limit Reached",
        description: "Use promo code DA62 to get Unlimited Premium.",
        variant: "destructive",
        action: (
          <Link href="/#pricing">
            <Button variant="outline" size="sm" className="border-white text-white">Upgrade</Button>
          </Link>
        )
      });
  };

  const incrementUsage = async (user: any) => {
      const today = new Date().toISOString().split('T')[0];
      
      if (!user) {
          const storage = localStorage.getItem('guest_usage');
          let data = storage ? JSON.parse(storage) : { date: today, count: 0 };
          if (data.date !== today) data = { date: today, count: 0 };
          data.count++;
          localStorage.setItem('guest_usage', JSON.stringify(data));
          setUsageCount(data.count);
      } else {
          const prefs = user.prefs || {};
          let count = (prefs.lastUsageDate === today) ? (prefs.dailyCount || 0) : 0;
          try {
            const account = getAppwriteAccount();
            await account.updatePrefs({ ...prefs, lastUsageDate: today, dailyCount: count + 1 });
            setUsageCount(count + 1);
          } catch(e) {}
      }
  };

  const optimizePrompt = async () => {
    if (!prompt.trim()) return;

    try {
      const account = getAppwriteAccount();
      let user = null;
      try { user = await account.get(); } catch (e) {}
      
      const allowed = await checkUsageLimit(user);
      if (!allowed) return;

      setIsOptimizing(true);
      
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style: outputStyle, model: selectedModel }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Optimization failed');

      setOptimizedPrompt(data.optimizedPrompt);
      
      // Update Usage
      await incrementUsage(user);
      
      // --- SAVE HISTORY LOGIC ---
      // Only save if NOT incognito
      if (!isIncognito) {
          try {
            if(user) {
                const databases = getAppwriteDatabases();
                await databases.createDocument('prompt-pro-db', 'history', 'unique()', {
                    prompt: prompt, response: data.optimizedPrompt, model: selectedModel, user_id: user.$id
                });
            }
          } catch (dbError) { 
              console.error("DB Save failed", dbError);
          }
      }

      toast({ title: "Prompt Optimized!", description: isIncognito ? "Optimized (Not Saved)" : "Enhanced successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsOptimizing(false);
    }
  };


  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      
      <TrustBadge />

      {/* --- USAGE BAR --- */}
      {!isPremium && (
        <div className="mb-6 max-w-md mx-auto bg-white dark:bg-gray-8
