"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getAppwriteAccount, ID } from "@/lib/appwrite";
import { Wand2, Loader2, ArrowLeft, Mail } from "lucide-react";
import Link from 'next/link';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const account = getAppwriteAccount();

      // 1. Create Account with Temporary Password (hidden from user)
      try {
        // We use a random string as the temporary password
        await account.create(ID.unique(), email, ID.unique() + ID.unique(), name);
      } catch (error: any) {
        // If user already exists, we just proceed to send the link (Login flow)
        if (error.type !== 'user_already_exists') {
          throw error;
        }
      }

      // 2. Send Magic URL (This acts as the Verification Link)
      // This link will redirect them to the 'setup-password' page
      const redirectUrl = `${window.location.origin}/setup-password`;
      await account.createMagicURLSession(ID.unique(), email, redirectUrl);

      toast({
        title: "Link Sent!",
        description: "Check your email to verify and set your password.",
      });

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
      {/* LEFT SIDE - Branding */}
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
            Start Optimizing <br/> <span className="text-violet-400">In Seconds</span>
          </h1>
          <p className="text-slate-300">Enter your email to verify your account and set up your secure password.</p>
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
              Create Account
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              We'll send you a link to verify your email.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className="h-11" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
            </div>

            <Button type="submit" className="w-full h-12 text-base font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Link...</>
              ) : (
                <><Mail className="mr-2 h-4 w-4" /> Send Verification Link</>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
