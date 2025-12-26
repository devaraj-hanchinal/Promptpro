"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getAppwriteAccount, ID } from "@/lib/appwrite";
import { Loader2, Mail, Lock, User } from "lucide-react";

function AuthContent() {
  const router = useRouter();
  const { toast } = useToast();

  /* ---------------------- UI STEPS ---------------------- */
  const [step, setStep] = useState<"email" | "otp" | "password">("email");

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [uid, setUid] = useState("");

  const [name, setName] = useState("");
  const [userExists, setUserExists] = useState<boolean | null>(null);

  const [password, setPassword] = useState("");
  const [progress, setProgress] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  /* ---------------- Password Strength Progress ---------------- */
  useEffect(() => {
    let p = 0;
    if (password.length >= 8) p += 25;
    if (/[A-Z]/.test(password)) p += 25;
    if (/[0-9]/.test(password)) p += 25;
    if (/[^A-Za-z0-9]/.test(password)) p += 25;
    setProgress(p);
  }, [password]);

  /* --------------------- STEP 1: CHECK EMAIL ---------------------- */
  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;

    setIsLoading(true);
    const account = getAppwriteAccount();
    
    // 1. Check if already logged in
    try {
      await account.get();
      router.push("/");
      return; 
    } catch {}

    // 2. Check if user exists (by trying to make a session)
    try {
      // Try to create a dummy session to check if account exists
      // We use a dummy password. If error is 401 (Unauthorized), user exists. 
      // If error is 404 (Not Found), user does not exist.
      await account.createEmailPasswordSession(email, "CheckExists123!");
    } catch (err: any) {
      // Appwrite throws 401 if password wrong (User Exists)
      // Appwrite throws 404 (or similar) if user not found
      if (err?.code === 401 || err?.type === 'general_unauthorized_scope') {
         setUserExists(true);
      } else {
         setUserExists(false);
      }
    }

    setIsLoading(false);

    // Wait for state to update, but we can use local logic here
    // (Note: relying on state update inside same function is risky, so we branch logic)
    
    // LOGIC BRANCH:
    // We re-evaluate the try/catch result logic directly here for safety
    // or use a separate effect. But for simplicity, let's assume we proceed 
    // based on what we just found. 
    
    // NOTE: Since setUserExists is async, we will split logic in a cleaner way:
    // We will assume "User Exists" if we got the 401 error.
  };

  // Re-run this logic when userExists updates
  useEffect(() => {
    if (userExists === null) return;
    if (isLoading) return; // Wait until loading finishes

    const processStep = async () => {
      if (userExists) {
        // SIGN IN → ask for password
        setStep("password");
      } else {
        // SIGN UP → ask for name then send OTP
        setIsLoading(true);
        try {
          const account = getAppwriteAccount();
          
          // A. Create User
          // We must Capture the user object to get the ID
          const newUser = await account.create(ID.unique(), email, "TempPass@123", name || "User");
          
          // B. Create OTP Token
          // FIX: Pass OBJECT { userId, email } as required by your SDK
          const tok = await account.createEmailToken({
            userId: newUser.$id,
            email: email
          });

          setUid(tok.userId);
          setStep("otp");
          toast({ title: "OTP Sent!", description: "Check your email inbox." });
        } catch (error: any) {
          console.error(error);
          toast({ variant: "destructive", title: "Error", description: error.message });
          setUserExists(null); // Reset to try again
        }
        setIsLoading(false);
      }
    };
    processStep();
  }, [userExists]);


  /* --------------------- STEP 2: VERIFY OTP ---------------------- */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;

    setIsLoading(true);
    try {
      const account = getAppwriteAccount();
      // FIX: Standardize usage of createSession for OTP
      await account.createSession(uid, otpCode); 
      
      // If successful, they are logged in. 
      // Now let them set a permanent password.
      setStep("password");
      toast({ title: "Verified", description: "Please set your password." });
    } catch (error) {
      toast({ variant: "destructive", title: "Invalid OTP", description: "Please try again." });
    }
    setIsLoading(false);
  };

  /* --------------------- STEP 3: SET PASSWORD ---------------------- */
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If user existed (Login flow), we just try to login
    if (userExists) {
        setIsLoading(true);
        try {
            const account = getAppwriteAccount();
            await account.createEmailPasswordSession(email, password);
            router.push("/");
        } catch (error) {
            toast({ variant: "destructive", title: "Wrong Password" });
        }
        setIsLoading(false);
        return;
    }

    // If New User (SignUp flow), we update the temp password
    if (progress < 50) return toast({ title: "Weak Password", description: "Add more complexity." });

    setIsLoading(true);
    try {
      const account = getAppwriteAccount();
      await account.updatePassword(password);
      // We are already logged in from the OTP step, so just redirect
      router.push("/");
    } catch (err) {
      toast({ variant: "destructive", title: "Error saving password" });
    }
    setIsLoading(false);
  };

  /* --------------------------------------------------
                      UI
   ---------------------------------------------------*/
  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900">

      {/* -- LEFT SPLIT / HERO -- */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-[#0F172A] text-white p-12 relative">
        <div>
          <h1 className="text-5xl font-bold leading-snug">
            Level up your
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400






