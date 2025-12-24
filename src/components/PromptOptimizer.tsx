"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Copy, Check, RefreshCw, Eraser } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getAppwriteDatabases, getAppwriteAccount } from "@/lib/appwrite";

export default function PromptOptimizer() {
  const [prompt, setPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedModel, setSelectedModel] = useState('general');
  const [outputStyle, setOutputStyle] = useState('detailed');
  const [usageCount, setUsageCount] = useState(0);
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(optimizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied to clipboard",
      description: "Ready to paste into your favorite AI tool",
    });
  };

  const handleClear = () => {
    setPrompt('');
    setOptimizedPrompt('');
    setCopied(false);
  };

  // --- NEW: SMART USAGE LIMIT CHECK ---
  const checkUsageLimit = async (user: any): Promise<boolean> => {
    const today = new Date().toISOString().split('T')[0];
    const MAX_DAILY = 5;

    // 1. PREMIUM CHECK (Labels OR Preferences)
    const isPremiumLabel = user && user.labels && user.labels.includes('premium');
    const isPremiumPlan = user && user.prefs && user.prefs.plan === 'premium';

    if (isPremiumLabel || isPremiumPlan) {
      return true; // Unlimited access
    }

    // 2. GUEST CHECK (LocalStorage)
    if (!user) {
      const storage = localStorage.getItem('guest_usage');
      let data = storage ? JSON.parse(storage) : { date: today, count: 0 };
      
      // Reset counter if it's a new day
      if (data.date !== today) {
        data = { date: today, count: 0 };
      }

      if (data.count >= MAX_DAILY) {
        toast({
          title: "Daily Limit Reached",
          description: "Guests get 5 free optimizations per day. Sign in to claim unlimited Premium.",
          variant: "destructive",
          action: (
            <Link href="/auth" className="w-full">
              <Button variant="outline" size="sm" className="w-full border-white text-white hover:bg-white hover:text-red-600">
                Claim Premium
              </Button>
            </Link>
          )
        });
        return false;
      }

      // Increment usage
      data.count++;
      localStorage.setItem('guest_usage', JSON.stringify(data));
      return true;
    }

    // 3. FREE USER CHECK (Appwrite Preferences)
    const prefs = user.prefs || {};
    let lastDate = prefs.lastUsageDate;
    let count = prefs.dailyCount || 0;

    if (lastDate !== today) {
      count = 0;
    }

    if (count >= MAX_DAILY) {
      toast({
        title: "Daily Limit Reached",
        description: "Free limit reached. Click 'Get Free Premium' in the header to upgrade instantly.",
        variant: "destructive",
      });
      return false;
    }

    // Increment and Save to Cloud
    try {
      const account = getAppwriteAccount();
      await account.updatePrefs({ 
        ...prefs, 
        lastUsageDate: today, 
        dailyCount: count + 1 
      });
    } catch (e) {
      console.error("Failed to update usage stats", e);
    }
    
    return true;
  };

  const optimizePrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to optimize",
        variant: "destructive",
      });
      return;
    }

    // --- CHECK LIMITS BEFORE OPTIMIZING ---
    try {
      const account = getAppwriteAccount();
      let user = null;
      try {
        user = await account.get();
      } catch (e) {
        // User is guest
      }

      const allowed = await checkUsageLimit(user);
      if (!allowed) return; // Stop execution if limit reached

    } catch (err) {
      console.error("Usage check failed", err);
    }

    setIsOptimizing(true);
    try {
      // 1. Optimize the prompt
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          style: outputStyle,
          model: selectedModel
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Optimization failed');

      const optimized = data.optimizedPrompt;
      setOptimizedPrompt(optimized);
      setUsageCount((prev) => prev + 1);

      // 2. Save to History (Only if logged in)
      try {
        const account = getAppwriteAccount();
        const user = await account.get(); 
        const databases = getAppwriteDatabases();

        await databases.createDocument(
          'prompt-pro-db', 
          'history',       
          'unique()',      
          {
            prompt: prompt,
            response: optimized,
            model: selectedModel,
            user_id: user.$id
          }
        );
        console.log("History saved successfully!");
      } catch (dbError) {
        console.log("History not saved (User might be logged out)");
      }

      toast({
        title: "Prompt Optimized!",
        description: "Your prompt has been enhanced successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Optimization Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto p-4">
      {/* Input Section */}
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm h-full flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Wand2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Your Prompt</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Enter the prompt you want to optimize</p>
            </div>
          </div>

          <Textarea 
            placeholder="e.g., Write a blog post about AI..."
            className="flex-1 min-h-[200px] resize-none text-base p-4 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:ring-purple-500 mb-4"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target AI Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Optimize Prompt
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <Eraser className="w-4 h-4" />
              <span className="sr-only">Clear</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Output Section */}
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
            {optimizedPrompt || (
              <span className="text-gray-400 italic">
                Your optimized prompt will appear here...
              </span>
            )}
          </div>

          <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
            <span>
              {usageCount > 0 ? `Optimized ${usageCount} times this session` : 'Paste this optimized prompt into your favorite AI tool'}
            </span>
            {optimizedPrompt && (
              <Button 
                variant="ghost" 
                size="sm" 
                className={copied ? "text-green-600" : "text-gray-600"}
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
