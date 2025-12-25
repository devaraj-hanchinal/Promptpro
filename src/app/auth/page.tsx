"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getAppwriteAccount, ID } from "@/lib/appwrite";
import { Wand2, Loader2, ArrowLeft, Check, Star, Mail, Lock, User, Eye, EyeOff, Circle } from "lucide-react";

function AuthContent() {
  const [view, setView] = useState<'signIn' | 'signUp' | 'magicSent' | 'setPassword'>('signIn');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // URL Params (for detecting return from email)
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  const { toast } = useToast();
  const router = useRouter();

  // Password Validation
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);

  // 1. CHECK FOR MAGIC LINK RETURN
  useEffect(() => {
    const handleMagicLink = async () => {
      if (userId && secret) {
        setIsLoading(true);
        try {
          const account = getAppwriteAccount();
          // Verify and Login the user
          await account.updateMagicURLSession(userId, secret);
          
          // Check if they already have a password set (Existing user vs New User)
          // Note: Appwrite doesn't easily expose "hasPassword", so we assume 
          // if they are in this flow via Magic Link, we let them set/reset it.
          
          toast({ title: "Email Verified!", description: "Please create your password." });
          setView('setPassword');
        } catch (error: any) {
          console.error(error);
          toast({ variant: "destructive", title: "Verification Failed", description: "Link expired or invalid." });
          setView('signIn');
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleMagicLink();
  }, [userId, secret]);

  // 2. HANDLE FORM SUBMISSIONS
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const account = getAppwriteAccount();

      // --- FLOW A: SIGN IN (Standard) ---
      if (view === 'signIn') {
        await account.createEmailPasswordSession(email, password);
        toast({ title: "Welcome back!", description: "Logged in successfully." });
        window.location.href = '/';
      }

      // --- FLOW B: SIGN UP STEP 1 (Send Magic Link) ---
      else if (view === 'signUp') {
        // Save name locally to restore it after they return from email
        localStorage.setItem('temp_signup_name', name);

        // Redirect URL points back to this page
        const redirectUrl = `${window.location.origin}/auth`;
        
        // Create Magic URL (Creates user + sends email)
        await account.createMagicURLToken(ID.unique(), email, redirectUrl);
        
        setView('magicSent');
        toast({ title: "Link Sent!", description: "Check your email to verify." });
      }

      // --- FLOW C: SET PASSWORD (After Verification) ---
      else if (view === 'setPassword') {
        if (!hasMinLength || !hasNumber) throw new Error("Password requirements not met.");

        // Retrieve name if we saved it, or use what's in the box
        const savedName = localStorage.getItem('temp_signup_name');
        const finalName = name || savedName;

        // Update Password
        await account.updatePassword(password);
        
        // Update Name (if provided)
        if (finalName) {
            await account.updateName(finalName);
            localStorage.removeItem('temp_signup_name'); // Clean up
        }

        toast({ title: "Account Created!", description: "Welcome to Prompt Pro." });
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
    <div className="min-h-screen w-full flex">
      {/* LEFT SIDE - Branding (Unchanged) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-md text-white p-8">
           <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
               <Wand2 className="w-6 h-6 text-violet-400" />
            </div>
            <span className="font-bold text-xl">Prompt Pro</span>
          </div>
          <h1 className="text-4xl font-bold mb-6">Unlock <span className="text-violet-400">Generative AI</span></h1>
          <div className="space-y-4 mb-12">
            {["Unlimited optimizations", "Advanced Models", "Secure History"].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300">
                <div className="p-1 rounded-full bg-violet-500/20 text-violet-400"><Check className="w-4 h-4" /></div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Dynamic Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          
          {/* Back Button (Only if not in magicSent view) */}
          {view !== 'magicSent' && (
             <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
             </Link>
          )}

          {/* HEADER TEXT */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {view === 'signIn' && "Welcome back"}
              {view === 'signUp' && "Create free account"}
              {view === 'magicSent' && "Check your inbox"}
              {view === 'setPassword' && "Create Password"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {view === 'signIn' && "Sign in to access your dashboard."}
              {view === 'signUp' && "Enter your details to verify your email."}
              {view === 'magicSent' && `We sent a verification link to ${email}`}
              {view === 'setPassword' && "Secure your account to finish setup."}
            </p>
          </div>

          {/* --- VIEW: MAGIC LINK SENT --- */}
          {view === 'magicSent' && (
            <div className="flex flex-col gap-4">
              <div className="bg-violet-50 text-violet-900 p-4 rounded-lg flex items-start gap-3 border border-violet-100">
                <Mail className="w-5 h-5 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold">Verification Link Sent</p>
                  <p className="opacity-90 mt-1">Click the link in your email to verify your address and create your password.</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setView('signIn')} className="w-full">
                Back to Sign In
              </Button>
            </div>
          )}

          {/* --- VIEW: FORMS --- */}
          {view !== 'magicSent' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Name Input (SignUp or SetPassword) */}
              {(view === 'signUp' || view === 'setPassword') && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 h-11" required={view === 'signUp'} />
                  </div>
                </div>
              )}

              {/* Email Input (SignIn or SignUp) */}
              {(view === 'signIn' || view === 'signUp') && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 h-11" />
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
                      className="pl-10 h-11 pr-10" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength (Only for SetPassword) */}
                  {view === 'setPassword' && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                       <div className={`flex items-center gap-2 text-xs font-medium ${hasMinLength ? 'text-green-600' : 'text-gray-400'}`}>
                         <Check className={`w-3 h-3 ${hasMinLength ? 'opacity-100' : 'opacity-20'}`} /> 8+ chars
                       </div>
                       <div className={`flex items-center gap-2 text-xs font-medium ${hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                         <Check className={`w-3 h-3 ${hasNumber ? 'opacity-100' : 'opacity-20'}`} /> Number
                       </div>
                    </div>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full h-12 text-base font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  view === 'signIn' ? "Sign In" : 
                  view === 'signUp' ? "Verify Email" : 
                  "Create Account"
                )}
              </Button>
            </form>
          )}

          {/* TOGGLE MODES */}
          {view !== 'setPassword' && view !== 'magicSent' && (
            <div className="mt-6 text-center text-sm">
              <span className="text-gray-500">
                {view === 'signUp' ? "Already have an account? " : "Don't have an account? "}
              </span>
              <button 
                onClick={() => setView(view === 'signUp' ? 'signIn' : 'signUp')} 
                className="font-semibold text-violet-600 hover:underline"
              >
                {view === 'signUp' ? "Sign In" : "Sign Up"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrapper for Suspense (Crucial for Vercel)
export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <AuthContent />
    </Suspense>
  );
}
