"use client";

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Wand2, Loader2, Mail, Lock, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { getAppwriteAccount, ID } from "@/lib/appwrite";

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
  
  // Ref to prevent double-firing in dev mode
  const verifying = useRef(false);

  // ---------------------------------------------------------
  // 1. MAGIC LINK VERIFICATION LOGIC (The Fix)
  // ---------------------------------------------------------
  useEffect(() => {
    const handleMagicLink = async () => {
      // Basic validation
      if (!userId || !secret) return;
      
      // Prevent double execution
      if (verifying.current) return;
      verifying.current = true;

      setIsLoading(true);

      try {
        const account = getAppwriteAccount();

        // STEP A: Check if we are ALREADY logged in
        // (This saves us if React runs this code a second time)
        try {
          await account.get();
          console.log("User already active. Skipping token check.");
          setView('setPassword');
          setIsLoading(false);
          return; // STOP HERE!
        } catch (err) {
          // If account.get() fails, it means we are NOT logged in yet.
          // That is good! Proceed to Step B.
        }

        // STEP B: Use the Token (Only if Step A failed)
        await account.updateMagicURLSession(userId, secret);
        
        toast({ title: "Success!", description: "Account verified." });
        setView('setPassword');

      } catch (error: any) {
        console.error("Verification Failed:", error);
        
        // Final safety check: Did it fail because we logged in too fast?
        try {
            const account = getAppwriteAccount();
            await account.get();
            setView('setPassword'); // Actually, we are fine!
        } catch (finalError) {
            toast({ 
              variant: "destructive", 
              title: "Link Invalid or Expired", 
              description: "Please request a new login link." 
            });
            setView('signIn');
        }
      } finally {
        setIsLoading(false);
      }
    };

    handleMagicLink();
  }, [userId, secret]);


  // ---------------------------------------------------------
  // 2. FORM SUBMISSION LOGIC
  // ---------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const account = getAppwriteAccount();

      if (view === 'signUp') {
        // Create Magic Link for Sign Up
        // Redirect to same page with params
        const redirectUrl = `${window.location.origin}/auth`; 
        
        // 1. Create Account
        await account.create(ID.unique(), email, 'placeholder-password', name);
        
        // 2. Create Magic URL
        await account.createMagicURLToken(ID.unique(), email, redirectUrl);
        
        setView('magicSent');
        toast({ title: "Magic Link Sent", description: "Check your email to verify your account." });
      
      } else if (view === 'signIn') {
        // Sign In with Magic Link
        const redirectUrl = `${window.location.origin}/auth`;
        await account.createMagicURLToken(ID.unique(), email, redirectUrl);
        
        setView('magicSent');
        toast({ title: "Magic Link Sent", description: "Check your email to sign in." });

      } else if (view === 'setPassword') {
        // Finalize Account with Password
        await account.updatePassword(password);
        toast({ title: "All Set!", description: "Account created successfully." });
        router.push('/dashboard'); // or wherever you want them to go
      }

    } catch (error: any) {
      console.error("Auth Error:", error);
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error.message || "Something went wrong." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------
  // 3. RENDER UI
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-full">
              <Wand2 className="w-8 h-8 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {view === 'signIn' && "Welcome back"}
            {view === 'signUp' && "Create an account"}
            {view === 'magicSent' && "Check your email"}
            {view === 'setPassword' && "Set your password"}
          </CardTitle>
          <CardDescription className="text-center">
            {view === 'signIn' && "Enter your email to sign in"}
            {view === 'signUp' && "Enter your details to get started"}
            {view === 'magicSent' && `We sent a magic link to ${email}`}
            {view === 'setPassword' && "Secure your account with a password"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {view === 'magicSent' ? (
             <div className="flex flex-col items-center justify-center py-6 space-y-4">
               <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                 <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
               </div>
               <p className="text-sm text-center text-gray-500">
                 Click the link in your email to continue. You can close this tab.
               </p>
               <Button variant="outline" onClick={() => setView('signIn')} className="w-full">
                 Back to Sign In
               </Button>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name Field (Only for Sign Up) */}
              {view === 'signUp' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              {/* Email Field (SignIn & SignUp) */}
              {(view === 'signIn' || view === 'signUp') && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}

              {/* Password Field (Only for SetPassword) */}
              {view === 'setPassword' && (
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  <>
                    {view === 'signIn' && "Sign In with Magic Link"}
                    {view === 'signUp' && "Sign Up with Magic Link"}
                    {view === 'setPassword' && "Complete Setup"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>

        {/* Footer Links */}
        <CardFooter className="flex justify-center">
          {view === 'signIn' && (
            <p className="text-sm text-gray-500">
              New to Prompt Pro?{' '}
              <button onClick={() => setView('signUp')} className="text-violet-600 hover:underline font-medium">
                Create Account
              </button>
            </p>
          )}
          {view === 'signUp' && (
             <p className="text-sm text-gray-500">
               Already have an account?{' '}
               <button onClick={() => setView('signIn')} className="text-violet-600 hover:underline font-medium">
                 Sign In
               </button>
             </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>}>
      <AuthContent />
    </Suspense>
  );
}
