"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAppwriteAccount } from "@/lib/appwrite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Check, Circle, Eye, EyeOff } from "lucide-react";

function SetupContent() {
  const [status, setStatus] = useState<'verifying' | 'setting' | 'success'>('verifying');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');
  const { toast } = useToast();
  const router = useRouter();

  // Validate Password
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);

  useEffect(() => {
    const verifyAndLogin = async () => {
      if (!userId || !secret) return;
      try {
        const account = getAppwriteAccount();
        // This validates the email AND logs the user in
        await account.updateMagicURLSession(userId, secret);
        setStatus('setting'); // Move to password creation step
      } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Invalid Link", description: "This link has expired or is invalid." });
        router.push('/auth');
      }
    };
    verifyAndLogin();
  }, [userId, secret, router, toast]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasMinLength || !hasNumber) return;
    
    setIsLoading(true);
    try {
      const account = getAppwriteAccount();
      // Update the temporary password to the real one
      await account.updatePassword(password);
      
      setStatus('success');
      toast({ title: "Success!", description: "Password set successfully." });
      
      // Redirect to home after 2 seconds
      setTimeout(() => window.location.href = '/', 2000);
      
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      setIsLoading(false);
    }
  };

  if (status === 'verifying') {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
        <h2 className="text-xl font-semibold">Verifying your email...</h2>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="p-3 bg-green-100 rounded-full">
          <Check className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">You're all set!</h2>
        <p className="text-gray-500">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold mb-2 text-center">Create Password</h2>
      <p className="text-center text-gray-500 mb-8">Your email is verified. Now secure your account.</p>
      
      <form onSubmit={handleSetPassword} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="h-11 pr-10" 
            />
             <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
          </div>

           {/* Password Strength Checklist */}
           <div className="grid grid-cols-2 gap-2 mt-2">
             <div className={`flex items-center gap-2 text-xs font-medium transition-all ${hasMinLength ? 'text-green-600' : 'text-gray-400'}`}>
               <div className={`flex items-center justify-center w-4 h-4 rounded-full border ${hasMinLength ? 'bg-green-100 border-green-500' : 'border-gray-300'}`}>
                  {hasMinLength ? <Check className="w-2.5 h-2.5 text-green-600" /> : <Circle className="w-1.5 h-1.5" />}
               </div>
               <span>8+ characters</span>
             </div>
             <div className={`flex items-center gap-2 text-xs font-medium transition-all ${hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
               <div className={`flex items-center justify-center w-4 h-4 rounded-full border ${hasNumber ? 'bg-green-100 border-green-500' : 'border-gray-300'}`}>
                  {hasNumber ? <Check className="w-2.5 h-2.5 text-green-600" /> : <Circle className="w-1.5 h-1.5" />}
               </div>
               <span>Contains number</span>
             </div>
          </div>
        </div>

        <Button type="submit" className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white" disabled={isLoading || !hasMinLength || !hasNumber}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Complete Setup"}
        </Button>
      </form>
    </div>
  );
}

export default function SetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin" />}>
        <SetupContent />
      </Suspense>
    </div>
  );
}
