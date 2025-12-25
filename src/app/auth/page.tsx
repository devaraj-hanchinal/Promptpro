"use client";

import { useState, useEffect, Suspense, useRef } from 'react'; // <--- 1. ADD useRef
import { useRouter, useSearchParams } from 'next/navigation';
// ... keep other imports (Link, Button, etc) ...
import { getAppwriteAccount, ID } from "@/lib/appwrite";
// ... keep icons ...

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

  // 2. ADD THIS REF (Prevents double-firing)
  const verifying = useRef(false);

  // 3. UPDATE THIS USE EFFECT
  useEffect(() => {
    const handleMagicLink = async () => {
      // Check if we have IDs AND if we haven't started verifying yet
      if (userId && secret && !verifying.current) {
        
        verifying.current = true; // <--- Lock it immediately
        setIsLoading(true);
        
        try {
          const account = getAppwriteAccount();
          await account.updateMagicURLSession(userId, secret);
          
          toast({ title: "Success!", description: "Account verified. Please set a password." });
          setView('setPassword');
        } catch (error: any) {
          console.error("Verification Error:", error);
          
          // Ignore if user is already logged in
          if (error.code === 401 || error.type === 'general_unauthorized_scope') {
             // likely already logged in, just proceed
             setView('setPassword');
          } else {
             toast({ 
               variant: "destructive", 
               title: "Link Invalid", 
               description: "This link was already used or has expired. Please try signing in again." 
             });
             setView('signIn');
          }
        } finally {
          setIsLoading(false);
        }
      }
    };
    handleMagicLink();
  }, [userId, secret]);

  // ... rest of your code (handleSubmit, return JSX) stays exactly the same ...
