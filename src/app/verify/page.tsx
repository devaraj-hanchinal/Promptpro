"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAppwriteAccount } from "@/lib/appwrite";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from 'next/link';

// 1. Create a sub-component for the logic that uses Search Params
function VerifyContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const searchParams = useSearchParams();
  const secret = searchParams.get('secret');
  const userId = searchParams.get('userId');

  useEffect(() => {
    const verify = async () => {
      if (!secret || !userId) {
        setStatus('error');
        return;
      }
      try {
        const account = getAppwriteAccount();
        await account.updateVerification(userId, secret);
        setStatus('success');
      } catch (error) {
        console.error(error);
        setStatus('error');
      }
    };
    verify();
  }, [secret, userId]);

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
          <h2 className="text-xl font-semibold">Verifying your email...</h2>
        </div>
      )}
      {status === 'success' && (
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
             <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold">Email Verified!</h2>
          <p className="text-gray-500">Your account is active. Enjoy your free Premium access.</p>
          <Link href="/">
            <Button className="mt-4 bg-violet-600 text-white w-full">Go to Dashboard</Button>
          </Link>
        </div>
      )}
      {status === 'error' && (
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
             <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold">Verification Failed</h2>
          <p className="text-gray-500">The link might be expired or invalid.</p>
          <Link href="/auth">
            <Button variant="outline" className="mt-4 w-full">Back to Login</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

// 2. Main Page Component wraps the content in Suspense
export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
