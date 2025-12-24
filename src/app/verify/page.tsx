"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAppwriteAccount } from "@/lib/appwrite";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from 'next/link';

function VerifyContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  
  const searchParams = useSearchParams();
  const secret = searchParams.get('secret');
  const userId = searchParams.get('userId');
  
  // 🔒 Prevent double-firing in React Strict Mode
  const hasRan = useRef(false);

  useEffect(() => {
    // If missing params, stop immediately
    if (!secret || !userId) {
      setStatus('error');
      setErrorMessage('Invalid link. Missing secret or User ID.');
      return;
    }

    // If already ran, stop (prevents "Invalid Token" error on 2nd run)
    if (hasRan.current) return;
    hasRan.current = true;

    const verify = async () => {
      try {
        const account = getAppwriteAccount();
        await account.updateVerification(userId, secret);
        setStatus('success');
      } catch (error: any) {
        console.error("Verification Error:", error);
        
        // If the error says "Invalid token" but it ran fast, it might actually be verified.
        // But usually, we just show the error.
        setStatus('error');
        setErrorMessage(error.message || "Unknown error occurred");
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
          <p className="text-sm text-gray-500">Please wait a moment.</p>
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
          <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg w-full">
            <p className="text-sm text-red-600 font-mono break-words">{errorMessage}</p>
          </div>
          <p className="text-gray-500 text-sm">The link might be expired or already used.</p>
          <Link href="/auth">
            <Button variant="outline" className="mt-4 w-full">Back to Login</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin" />}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
