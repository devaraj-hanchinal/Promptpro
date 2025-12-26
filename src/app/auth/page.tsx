"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getAppwriteAccount, ID } from "@/lib/appwrite";
import { 
  Wand2, Loader2, ArrowLeft, Check, Star, Mail, Lock, User, Eye, EyeOff, ArrowRight 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function AuthContent() {
  const [view, setView] = useState<'signIn' | 'signUp' | 'magicSent' | 'setPassword'>('signIn');
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  const { toast } = useToast();
  const router = useRouter();

  // Password validation
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);

  /* -------------------------------------------------
      HANDLE VERIFICATION RETURN FROM EMAIL LINK
  ---------------------------------------------------*/
  useEffect(() => {
    const handleMagicLink = async () => {
      if (userId && secret) {
        setIsLoading(true);
        try {
          const account = getAppwriteAccount();
          await account.updateMagicURLSession(userId, secret);

          toast({ title: "Email Verified!", description: "Please secure your account." });

          const storedName = localStorage.getItem("temp_signup_name");
          if (storedName) setName(storedName);

          setView('setPassword');
        } catch (err: any) {
          console.error(err);
          toast({ variant: "destructive", title: "Link Invalid", description: "This link has expired." });
          setView('signIn');
        } finally {
          setIsLoading(false);
        }
      }
    };
    handleMagicLink();
  }, [userId, secret, toast]);

  /* -------------------------------------------------
          HANDLE SIGN-IN | SIGN-UP | SET PASSWORD
  ---------------------------------------------------*/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const account = getAppwriteAccount();

      /* ----------- SIGN IN ----------- */
      if (view === 'signIn') {
        try {
          await account.createEmailPasswordSession(email, password);
          toast({ title: "Welcome back!", description: "Logged in successfully." });
          window.location.href = '/';
        } catch {
          toast({
            title: "Account not found?",
            description: "Switched to Sign Up — verify your email to continue.",
            duration: 5000,
          });
          setView('signUp');
        }
      }

      /* ----------- SIGN UP ----------- */
      else if (view === 'signUp') {
        localStorage.setItem("temp_signup_name", name);
        const redirectUrl = `${window.location.origin}/auth`;

        await account.createMagicURLToken(ID.unique(), email, redirectUrl);
        setView('magicSent');

        toast({ title: "Verification Sent!", description: "Check your email & click the link." });
      }

      /* ----------- SET PASSWORD ----------- */
      else if (view === 'setPassword') {
        if (!hasMinLength || !hasNumber)
          throw new Error("Password must have 8+ characters and 1 number.");

        const finalName = name || localStorage.getItem('temp_signup_name');

        await account.updatePassword(password);

        if (finalName) {
          await account.updateName(finalName);
          localStorage.removeItem('temp_signup_name');
        }

        // 🔥 CRITICAL FIX: create a real session now
        await account.createEmailPasswordSession(email, password);

        toast({ title: "All Set!", description: "Account secured. Welcome to Prompt Pro!" });
        window.location.href = '/';
      }

    } catch (err: any) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------------------------------
                      UI
  ---------------------------------------------------*/
  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-gray-900">
      
      {/* LEFT SIDE — Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#0F172A] text-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col justify-between w-full h-full p-12">

          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-lg border border-white/10">
              <Wand2 className="w-5 h-5 text-violet-400" />
            </div>
            <span className="font-bold text-lg">Prompt Pro</span>
          </div>

          <div className="space-y-8">
            <h1 className="text-5xl font-bold leading-[1.15]">
              Stop struggling with <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                AI Prompts.
              </span>
            </h1>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl max-w-md">
              <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Optimization Complete</p>
                  <p className="text-xs text-slate-400">Saved 15 minutes rewriting</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-slate-400 line-through">"Write a blog about coffee."</p>
                <p className="text-xs text-slate-200">"Write a comprehensive SEO-optimized blog post about coffee brewing techniques..."</p>
              </div>

