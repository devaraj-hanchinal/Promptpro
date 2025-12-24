"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getAppwriteAccount, ID } from "@/lib/appwrite";
import { Wand2, Loader2, ArrowLeft, Check, Star, Eye, EyeOff, Circle } from "lucide-react";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New State for visibility
  
  const { toast } = useToast();
  const router = useRouter();

  // Password Validation Checks
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password); // Checks for at least one digit (0-9)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const account = getAppwriteAccount();

      if (isSignUp) {
        // Enforce strong password on Sign Up
        if (!hasMinLength || !hasNumber) {
          throw new Error("Password does not meet requirements.");
        }

        // 1. Create Account
        await account.create(ID.unique(), email, password, name);
        
        // 2. Create Session (Log in)
        await account.createEmailPasswordSession(email, password);

        // 3. Trigger Email Verification
        const verifyUrl = `${window.location.origin}/verify`; 
        await account.createVerification(verifyUrl);

        toast({ 
          title: "Account created!", 
          description: "Please check your email to verify your account." 
        });
      } else {
        // Login Logic
        await account.createEmailPasswordSession(email, password);
        toast({ title: "Welcome back!", description: "You are now logged in." });
      }

      // Redirect to home
      window.location.href = '/'; 

    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* LEFT SIDE - Branding & Social Proof (Unchanged) */}
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

          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Unlock the full power of <br/>
            <span className="text-violet-400">Generative AI</span>
          </h1>
          
          <div className="space-y-4 mb-12">
            {[
              "Unlimited optimizations",
              "Advanced GPT-4 & Claude 3 Models",
              "Priority Processing Speed",
              "Secure History Storage"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300">
                <div className="p-1 rounded-full bg-violet-500/20 text-violet-400">
                  <Check className="w-4 h-4" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
             <div className="flex gap-1 mb-3">
               {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />)}
             </div>
             <p className="text-slate-300 italic mb-4">"I used to struggle with prompts. Now I get perfect results on the first try. A game changer."</p>
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-orange-500 flex items-center justify-center font-bold text-white">R</div>
               <div>
                 <p className="font-semibold text-sm">Rahul Sharma</p>
                 <p className="text-xs text-slate-400">Content Creator</p>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {isSignUp ? "Create free account" : "Welcome back"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {isSignUp ? "Sign up today to get started." : "Sign in to access your dashboard."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className="h-11" />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                {/* PASSWORD INPUT WITH TOGGLE */}
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="h-11 pr-10" // Add padding right for icon
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* PASSWORD STRENGTH INDICATORS (Only show on SignUp) */}
              {isSignUp && (
                <div className="flex gap-4 mt-2">
                   {/* Min Length Indicator */}
                   <div className="flex items-center gap-2 text-xs transition-colors duration-200">
                     <div className={`w-2 h-2 rounded-full ${hasMinLength ? 'bg-green-500' : 'bg-gray-300'}`} />
                     <span className={hasMinLength ? 'text-green-600' : 'text-gray-500'}>8+ characters</span>
                   </div>

                   {/* Number Indicator */}
                   <div className="flex items-center gap-2 text-xs transition-colors duration-200">
                     <div className={`w-2 h-2 rounded-full ${hasNumber ? 'bg-green-500' : 'bg-gray-300'}`} />
                     <span className={hasNumber ? 'text-green-600' : 'text-gray-500'}>Contains a number</span>
                   </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full h-12 text-base font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-indigo-500/20" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isSignUp ? "Creating..." : "Signing In..."}</>
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
            </span>
            <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-violet-600 hover:underline">
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
