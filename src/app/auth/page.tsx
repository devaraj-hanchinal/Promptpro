"use client";

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getAppwriteAccount, ID } from "@/lib/appwrite";
import { Wand2, Loader2, ArrowLeft, Mail, Lock, User, Eye, EyeOff, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

function AuthContent() {
  // STATES
  const [view, setView] = useState<'checkEmail' | 'signIn' | 'signUp'>('checkEmail');
  const [isLoading, setIsLoading] = useState(false);
  
  // FORM DATA
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { toast } = useToast();

  // VALIDATION
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const account = getAppwriteAccount();

    try {
      // --- PHASE 1: EMAIL CHECK (UI Transition Only) ---
      if (view === 'checkEmail') {
        // We simulate a check by just moving to Sign In. 
        // If they don't exist, the Login step will catch it and redirect.
        setIsLoading(false);
        setView('signIn');
        return;
      }

      // --- PHASE 2: SIGN IN ---
      if (view === 'signIn') {
        try {
          await account.createEmailPasswordSession(email, password);
          toast({ title: "Welcome back!", description: "Accessing your dashboard..." });
          window.location.href = '/';
        } catch (error: any) {
          console.log("Login failed", error);
          
          // SMART REDIRECT: If login fails, assume user might be new
          // We switch to Sign Up mode automatically
          toast({ 
            title: "Account not found (or wrong password)", 
            description: "We switched you to Sign Up. Create an account now!",
            duration: 5000 
          });
          setView('signUp');
        }
      }

      // --- PHASE 3: SIGN UP ---
      if (view === 'signUp') {
        if (!hasMinLength || !hasNumber) throw new Error("Password must be 8+ chars & include a number.");
        
        // 1. Create
        await account.create(ID.unique(), email, password, name);
        // 2. Login
        await account.createEmailPasswordSession(email, password);
        // 3. Verify
        const verifyUrl = `${window.location.origin}/verify`; 
        await account.createVerification(verifyUrl);

        toast({ title: "Account Created!", description: "Verification link sent to your email." });
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
      
      {/* --- LEFT SIDE: ATTRACTIVE VISUALS --- */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-950 items-center justify-center overflow-hidden p-12">
        
        {/* Abstract Background */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-violet-600/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[120px]" />
        
        {/* Content Container */}
        <div className="relative z-10 w-full max-w-lg">
          
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
             <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
               <Wand2 className="w-6 h-6 text-violet-300" />
             </div>
             <span className="font-bold text-2xl text-white tracking-tight">Prompt Pro</span>
          </div>

          {/* Floating Glass Cards (Before & After) */}
          <div className="space-y-6 mb-16">
            {/* Card 1: Bad Prompt */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl transform translate-x-4 opacity-60 scale-95">
              <div className="flex gap-3 items-center mb-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <p className="text-xs text-red-200 font-mono">BEFORE</p>
              </div>
              <p className="text-slate-300 text-sm font-medium">"Write a blog about coffee."</p>
            </div>

            {/* Arrow */}
            <div className="flex justify-center -my-3 relative z-20">
               <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-2 rounded-full shadow-lg shadow-violet-500/30">
                 <ArrowRight className="w-4 h-4 text-white" />
               </div>
            </div>

            {/* Card 2: Good Prompt */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl relative">
              <div className="absolute top-0 right-0 p-3">
                 <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300/20 animate-pulse" />
              </div>
              <div className="flex gap-3 items-center mb-3">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <p className="text-xs text-green-200 font-mono">OPTIMIZED</p>
              </div>
              <p className="text-white text-sm leading-relaxed font-medium">
                "Write a comprehensive SEO-optimized blog post about the history of coffee beans, targeting coffee enthusiasts..."
              </p>
            </div>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-2 gap-6">
            {[
              "10x Faster Generation",
              "GPT-4 & Claude Ready",
              "Privacy First",
              "Secure History"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-violet-400" />
                <span className="text-slate-300 text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>

        </div>
      </div>


      {/* --- RIGHT SIDE: SMART FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <Link href="/" className="absolute top-8 left-8 inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Link>

        <div className="w-full max-w-[400px] space-y-8">
          
          <div className="text-center space-y-2">
             <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {view === 'signUp' ? <User className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
             </div>
             <h2 className="text-3xl font-bold text-gray-900">
               {view === 'signUp' ? "Create Account" : "Welcome Back"}
             </h2>
             <p className="text-gray-500">
               {view === 'checkEmail' ? "Enter your email to get started." : 
                view === 'signIn' ? `Login to ${email}` : 
                "Looks like you're new here!"}
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* NAME FIELD (Only for SignUp) */}
            {view === 'signUp' && (
              <div className="space-y-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="John Doe" 
                    className="pl-10 h-11 bg-gray-50 border-gray-200" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>
              </div>
            )}

            {/* EMAIL FIELD */}
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input 
                  type="email" 
                  placeholder="name@work.com" 
                  className="pl-10 h-11 bg-gray-50 border-gray-200" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  disabled={view !== 'checkEmail' && view !== 'signUp'} // Lock email during login attempt
                  required 
                />
                {/* Edit Email Button (If locked) */}
                {view === 'signIn' && (
                  <button type="button" onClick={() => setView('checkEmail')} className="absolute right-3 top-3.5 text-xs text-violet-600 font-medium hover:underline">
                    Change
                  </button>
                )}
              </div>
            </div>

            {/* PASSWORD FIELD (SignIn or SignUp) */}
            {view !== 'checkEmail' && (
              <div className="space-y-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
                <div className="flex justify-between items-center">
                   <Label>Password</Label>
                   {view === 'signIn' && <span className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">Forgot?</span>}
                </div>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Strength Meter (SignUp Only) */}
                {view === 'signUp' && (
                   <div className="flex gap-3 mt-2">
                     <div className={`flex items-center gap-1 text-[11px] font-medium ${hasMinLength ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-green-500' : 'bg-gray-300'}`} /> 8+ Chars
                     </div>
                     <div className={`flex items-center gap-1 text-[11px] font-medium ${hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${hasNumber ? 'bg-green-500' : 'bg-gray-300'}`} /> Number
                     </div>
                   </div>
                )}
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-indigo-500/20" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                view === 'checkEmail' ? "Continue" : 
                view === 'signUp' ? "Create Account" : 
                "Sign In"
              )}
            </Button>
            
          </form>

          {/* Footer Text */}
          <p className="text-center text-xs text-gray-400 mt-6">
            By continuing, you agree to our Terms of Service <br/> and Privacy Policy.
          </p>
        </div>
      </div>

    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <AuthContent />
    </Suspense>
  );
}
