"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getAppwriteAccount, ID } from "@/lib/appwrite";
import { Wand2, Loader2, ArrowLeft, Check, Star, Mail, Lock, User, Eye, EyeOff, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function AuthContent() {
  const [view, setView] = useState<'signIn' | 'signUp' | 'magicSent' | 'setPassword'>('signIn');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  const { toast } = useToast();
  const router = useRouter();

  // Password Logic
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);

  // 1. HANDLE MAGIC LINK RETURN
  useEffect(() => {
    const handleMagicLink = async () => {
      if (userId && secret) {
        setIsLoading(true);
        try {
          const account = getAppwriteAccount();
          await account.updateMagicURLSession(userId, secret);
          toast({ title: "Email Verified!", description: "Please secure your account." });
          setView('setPassword');
        } catch (error: any) {
          console.error(error);
          toast({ variant: "destructive", title: "Link Invalid", description: "This link has expired." });
          setView('signIn');
        } finally {
          setIsLoading(false);
        }
      }
    };
    handleMagicLink();
  }, [userId, secret]);

  // 2. FORM SUBMISSION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const account = getAppwriteAccount();

      // --- FLOW A: SIGN IN ---
      if (view === 'signIn') {
        try {
          await account.createEmailPasswordSession(email, password);
          toast({ title: "Welcome back!", description: "Logged in successfully." });
          window.location.href = '/';
        } catch (loginError: any) {
          // SMART REDIRECT: If login fails, assume new user -> Switch to Sign Up
          console.log("Login failed, suggesting signup...", loginError);
          
          toast({ 
            title: "Account not found?", 
            description: "We've switched you to Sign Up so you can create one.",
            duration: 5000
          });
          
          setView('signUp'); // <--- The Redirect Logic
          // We keep the 'email' state so they don't have to retype it
        }
      }

      // --- FLOW B: SIGN UP (Send Link) ---
      else if (view === 'signUp') {
        localStorage.setItem('temp_signup_name', name);
        const redirectUrl = `${window.location.origin}/auth`;
        
        await account.createMagicURLToken(ID.unique(), email, redirectUrl);
        
        setView('magicSent');
        toast({ title: "Verification Sent!", description: "Check your email inbox." });
      }

      // --- FLOW C: SET PASSWORD ---
      else if (view === 'setPassword') {
        if (!hasMinLength || !hasNumber) throw new Error("Password needs 8 chars + 1 number.");

        const savedName = localStorage.getItem('temp_signup_name');
        const finalName = name || savedName;

        await account.updatePassword(password);
        if (finalName) {
            await account.updateName(finalName);
            localStorage.removeItem('temp_signup_name');
        }

        toast({ title: "All Set!", description: "Welcome to Prompt Pro." });
        window.location.href = '/';
      }

    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-gray-900">
      
      {/* --- LEFT SIDE: PROFESSIONAL BRANDING --- */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#0F172A] text-white">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col justify-between w-full h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
               <Wand2 className="w-5 h-5 text-violet-400" />
            </div>
            <span className="font-bold text-lg tracking-tight">Prompt Pro</span>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <h1 className="text-5xl font-bold leading-[1.15]">
              Stop struggling with <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                AI Prompts.
              </span>
            </h1>
            
            {/* Feature Card - Looking "Real" */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl max-w-md">
              <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Optimization Complete</p>
                  <p className="text-xs text-slate-400">Saved 15 minutes of rewriting</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="w-1 bg-red-500/50 rounded-full h-auto" />
                  <p className="text-xs text-slate-400 line-through">"Write a blog about coffee."</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-1 bg-green-500 rounded-full h-auto" />
                  <p className="text-xs text-slate-200">"Write a comprehensive SEO-optimized blog post about specialized coffee brewing techniques..."</p>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <Avatar key={i} className="border-2 border-[#0F172A] w-10 h-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} />
                    <AvatarFallback>U{i}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />)}
                </div>
                <p className="text-sm text-slate-400 mt-0.5">Trusted by <span className="text-white font-medium">12,000+ creators</span></p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-6 text-xs text-slate-500 font-medium">
            <span>© Prompt Pro Inc.</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: AUTH FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px] space-y-8">
          
          {/* Back Link */}
          {view !== 'magicSent' && (
             <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
             </Link>
          )}

          {/* Dynamic Header */}
          <div className="space-y-1.5">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {view === 'signIn' && "Welcome back"}
              {view === 'signUp' && "Create an account"}
              {view === 'magicSent' && "Check your inbox"}
              {view === 'setPassword' && "Secure your account"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {view === 'signIn' && "Enter your details to access your history."}
              {view === 'signUp' && "Start optimizing your prompts for free."}
              {view === 'magicSent' && `We sent a verification link to ${email}`}
              {view === 'setPassword' && "Set a password to login easier next time."}
            </p>
          </div>

          {/* --- VIEW: MAGIC LINK SENT --- */}
          {view === 'magicSent' && (
            <div className="flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
              <div className="bg-violet-50 dark:bg-violet-900/20 text-violet-900 dark:text-violet-200 p-4 rounded-xl flex items-start gap-3 border border-violet-100 dark:border-violet-900/50">
                <div className="p-2 bg-white dark:bg-violet-900 rounded-full shadow-sm">
                   <Mail className="w-5 h-5 text-violet-600 dark:text-violet-300" />
                </div>
                <div className="text-sm pt-1">
                  <p className="font-semibold">Verification Link Sent</p>
                  <p className="opacity-90 mt-1">We've sent a magic link to <strong>{email}</strong>. Click it to verify your account.</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setView('signIn')} className="w-full h-11">
                Back to Sign In
              </Button>
            </div>
          )}

          {/* --- VIEW: FORMS --- */}
          {view !== 'magicSent' && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-in slide-in-from-right-4 duration-500">
              
              {/* Name Input (SignUp or SetPassword only) */}
              {(view === 'signUp' || view === 'setPassword') && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input id="name" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 h-11 bg-gray-50 dark:bg-gray-800" required={view === 'signUp'} />
                  </div>
                </div>
              )}

              {/* Email Input (SignIn or SignUp) */}
              {(view === 'signIn' || view === 'signUp') && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input id="email" type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 h-11 bg-gray-50 dark:bg-gray-800" />
                  </div>
                </div>
              )}

              {/* Password Input (SignIn or SetPassword) */}
              {(view === 'signIn' || view === 'setPassword') && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      className="pl-10 h-11 pr-10 bg-gray-50 dark:bg-gray-800" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Checks (SetPassword Only) */}
                  {view === 'setPassword' && (
                    <div className="flex gap-4 mt-2">
                       <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${hasMinLength ? 'text-green-600' : 'text-gray-400'}`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-green-600' : 'bg-gray-300'}`} /> 8+ chars
                       </div>
                       <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${hasNumber ? 'bg-green-600' : 'bg-gray-300'}`} /> Number
                       </div>
                    </div>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full h-11 text-base font-medium bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 transition-all hover:scale-[1.02]" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  view === 'signIn' ? <span className="flex items-center">Sign In <ArrowRight className="ml-2 w-4 h-4" /></span> : 
                  view === 'signUp' ? "Verify Email" : 
                  "Create Account"
                )}
              </Button>
            </form>
          )}

          {/* Toggle Link */}
          {view !== 'setPassword' && view !== 'magicSent' && (
            <div className="mt-6 text-center text-sm">
              <span className="text-gray-500">
                {view === 'signUp' ? "Already have an account? " : "New to Prompt Pro? " }
              </span>
              <button 
                onClick={() => setView(view === 'signUp' ? 'signIn' : 'signUp')} 
                className="font-semibold text-violet-600 hover:text-violet-700 hover:underline transition-all"
              >
                {view === 'signUp' ? "Sign In" : "Create Account"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>}>
      <AuthContent />
    </Suspense>
  );
}
