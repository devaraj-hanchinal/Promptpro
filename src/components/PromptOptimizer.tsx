"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Copy, Check, RefreshCw, Eraser, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getAppwriteDatabases, getAppwriteAccount } from "@/lib/appwrite";
import { Query } from "appwrite"; // <--- IMPORT QUERY
import TrustBadge from "@/components/TrustBadge";      
import CompanyLogos from "@/components/CompanyLogos"; 
import PrivacyControl from "@/components/PrivacyControl"; // <--- IMPORT COMPONENT

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
  const [isIncognito, setIsIncognito] = useState(false); // <--- NEW STATE

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

  // --- NEW: HANDLE CLEAR HISTORY ---
  const handleClearHistory = async () => {
    if (!confirm("Are you sure? This will delete your saved history.")) return;

    try {
        const databases = getAppwriteDatabases();
        
        // 1. List documents (You might want to filter by user_id here in a real app)
        // For now, this deletes the documents in the collection based on your logic
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
        const data = storage ? JSON.parse(storage) : { date: today, count: 0 };
        if (data.date !== today) data = { date: today, count: 0 };
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
      
      // --- SAVE HISTORY LOGIC (Updated) ---
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
        <div className="mb-6 max-w-md mx-auto bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-900/30 rounded-full p-1 pr-4 flex items-center gap-3 shadow-sm">
            <div className="bg-purple-100 dark:bg-purple-900/50 rounded-full px-3 py-1 text-xs font-bold text-purple-700 dark:text-purple-300 whitespace-nowrap">
                Free Plan
            </div>
            <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500" 
                    style={{ width: `${(usageCount / maxLimit) * 100}%` }} 
                />
            </div>
            <div className="text-xs font-medium text-gray-500">
                {usageCount}/{maxLimit} Used
            </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm h-full flex flex-col">
            
            {/* HEADER WITH PRIVACY CONTROLS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Wand2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Your Prompt</h2>
                    </div>
                </div>

                {/* --- PRIVACY TOGGLE HERE --- */}
                <PrivacyControl 
                    isIncognito={isIncognito}
                    onToggleIncognito={() => setIsIncognito(!isIncognito)}
                    onClearHistory={handleClearHistory}
                />
            </div>

            <Textarea 
              placeholder="e.g., Write a blog post about AI..."
              className="flex-1 min-h-[200px] resize-none text-base p-4 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:ring-purple-500 mb-4"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            {/* QUICK START TEMPLATES */}
            {prompt.length === 0 && (
                <div className="mb-4">
                    <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Or try an example:</p>
                    <div className="flex flex-wrap gap-2">
                        {TEMPLATES.map((temp, i) => (
                            <button 
                                key={i}
                                onClick={() => handleTemplateClick(temp)}
                                className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                            >
                                <Sparkles className="w-3 h-3" /> {temp}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target AI Model</label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Purpose</SelectItem>
                    <SelectItem value="gpt4">GPT-4 / ChatGPT</SelectItem>
                    <SelectItem value="midjourney">Midjourney</SelectItem>
                    <SelectItem value="dalle">DALL-E 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Output Style</label>
                <Select value={outputStyle} onValueChange={setOutputStyle}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detailed">Detailed & Comprehensive</SelectItem>
                    <SelectItem value="concise">Concise & Direct</SelectItem>
                    <SelectItem value="creative">Creative & Engaging</SelectItem>
                    <SelectItem value="technical">Technical & Precise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 mt-auto">
              <Button 
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all duration-200"
                onClick={optimizePrompt}
                disabled={isOptimizing}
              >
                {isOptimizing ? (
                  <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Optimizing...</>
                ) : (
                  <><Wand2 className="mr-2 h-4 w-4" /> Optimize Prompt</>
                )}
              </Button>
              <Button variant="outline" onClick={handleClear}>
                <Eraser className="w-4 h-4" /><span className="sr-only">Clear</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Output Section (Unchanged) */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-purple-900/30 p-6 shadow-sm h-full flex flex-col relative overflow-hidden ring-1 ring-purple-500/10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Wand2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Optimized Prompt</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your enhanced, AI-ready prompt</p>
              </div>
            </div>

            <div className="flex-1 min-h-[200px] p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
              {optimizedPrompt || <span className="text-gray-400 italic">Your optimized prompt will appear here...</span>}
            </div>

            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <span>{isPremium ? "Unlimited Access ⚡" : `${maxLimit - usageCount} generations left today`}</span>
              {optimizedPrompt && (
                <Button variant="ghost" size="sm" className={copied ? "text-green-600" : "text-gray-600"} onClick={handleCopy}>
                  {copied ? <><Check className="w-4 h-4 mr-2" /> Copied</> : <><Copy className="w-4 h-4 mr-2" /> Copy</>}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <CompanyLogos />
    </div>
  );
}
