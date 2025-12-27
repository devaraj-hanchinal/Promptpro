"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from "next/navigation"; // <--- Added for Chrome Extension
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
  // --- STATES ---
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
  const searchParams = useSearchParams(); // <--- Added Hook

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

        // Check DB Usage
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

  // 2. CHECK FOR URL PARAMS (CHROME EXTENSION)
  useEffect(() => {
    const incomingPrompt = searchParams.get("prompt");
    if (incomingPrompt) {
      setPrompt(incomingPrompt);
      // Auto-scroll to input
      const textarea = document.querySelector('textarea');
      if (textarea) textarea.scrollIntoView({ behavior: 'smooth' });
    }
  }, [searchParams]);


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
            'database-prompt-pro-db', // <--- Make sure this ID matches your config
            'table-history',          // <--- Make sure this ID matches your config
            [Query.limit(100)]
        );

        // 2. Delete them
        const deletePromises = result.documents.map(doc => 
            databases.deleteDocument('database-prompt-pro-db', 'table-history', doc.$id)
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
      
      // Sending 'outputStyle' now instead of just 'style' string to match your API
      let styleLabel = "";
      if(outputStyle === "detailed") styleLabel = "Detailed & Comprehensive";
