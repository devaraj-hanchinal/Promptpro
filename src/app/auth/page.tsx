"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getAppwriteAccount, ID } from "@/lib/appwrite";
import { Loader2, Mail, Lock, CheckCircle2, ArrowRight } from "lucide-react";

function AuthContent() {
  const router = useRouter();
  const { toast } = useToast();

  // STATES
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [isLoading, setIsLoading] = useState(false);
  
  // DATA
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [uid, setUid] = useState(""); // Stores User ID for OTP
  
  // LOGIC FLAGS
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [passStrength, setPassStrength] = useState(0);

  // ---------------------------------------------------------
  // 1. PASSWORD STRENGTH CALCULATOR
  // ---------------------------------------------------------
  useEffect(() => {
    let score = 0;
    if (password.length > 7) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    setPassStrength(score);
  }, [password]);

  // ---------------------------------------------------------
  // 2. STEP 1: CHECK EMAIL (The "Ghost Login")
  // ---------------------------------------------------------
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;

    setIsLoading(true);
    const account = getAppwriteAccount();

    try {
      // TRICK: Try to login with a fake password to see error code
      await account.createEmailPasswordSession(email, "DUMMY_CHECK_123!");
    } catch (error: any) {
      // Error 401 = Password wrong (User Exists)
      // Error 404 (or General) = User not found (New User)
      if (error?.code === 401 || error?.type === 'general_unauthorized_scope') {
        setUserExists(true);
        setStep("password"); // Go to Login
      } else {
        setUserExists(false);
        await initiateSignUp(account); // Start Sign Up
      }
    }
    setIsLoading(false);
  };

  // ---------------------------------------------------------
  // 3. START SIGN UP (Send OTP)
  // ---------------------------------------------------------
  const initiateSignUp = async (account: any) => {
    try {
      // A. Create the User Account first
      // We use a temp password which we will replace in the final step
      const newUser = await account.create(ID.unique(), email, "TempPass@123", "User");
      
      // B. Send OTP to that user
      const token = await account.createEmailToken({
        userId: newUser.$id,
        email: email
      });

      setUid(token.userId);
      setStep("otp");
      toast({ title: "Account Created", description: "OTP sent to your email." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      // If user actually existed but check failed, reset
      setUserExists(null);
    }
  };

  // ---------------------------------------------------------
  // 4. VERIFY OTP
  // ---------------------------------------------------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const account = getAppwriteAccount();
      // Verify OTP -> This creates an active session!
      await account.createSession(uid, otpCode);
      
      // Success! Now let them set their real password
      setStep("password");
      toast({ title: "Verified!", description: "Now create your password." });
    } catch (error) {
      toast({ variant: "destructive", title: "Invalid Code", description: "Please try again." });
    }
    setIsLoading(false);
  };

  // ---------------------------------------------------------
  // 5. FINAL STEP (Login or Set Password)
  // ---------------------------------------------------------
  const handleFinalStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const account = getAppwriteAccount();

    try {
      if (userExists) {
        // --- LOGIN FLOW ---
        await account.createEmailPasswordSession(email, password);
      } else {
        // --- SIGN UP FLOW (Set Password) ---
        if (passStrength < 50) {
            toast({ variant: "destructive", title: "Password too weak" });
            setIsLoading(false);
            return;
        }
        // We are already logged in via OTP, so we just update the password
        await account.updatePassword(password);
      }

      // REDIRECT TO HOME
      router.push("/");
      toast({ title: "Welcome to Prompt Pro!" });

    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
    setIsLoading(false);
  };

  // ---------------------------------------------------------
  // RENDER UI
  // ---------------------------------------------------------
  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      
      {/* --- LEFT SIDE: HEROICS --- */}
      <div className="hidden lg:flex w-1/2 bg-[#020617] relative overflow-hidden flex-col justify-between p-16 text-white">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-8 w-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg" />
            <span className="text-xl font-bold tracking-tight">Prompt Pro</span>
          </div>
          
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Master the art of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              AI Communication
            </span>
          </h1>
          
          <p className="text-lg text-gray-400 max-w-md">
            Join 12,000+ creators optimizing their workflows. 
            Get enterprise-grade prompts, history tracking, and AI-powered refinement.
          </p>
        </div>

        {/* Heroic Stats */}
        <div className="grid grid-cols-2 gap-8 relative z-10">
          <div>
            <h3 className="text-3xl font-bold">1M+</h3>
            <p className="text-sm text-gray-500 uppercase tracking-wider mt-1">Prompts Optimized</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold">99%</h3>
            <p className="text-sm text-gray-500 uppercase tracking-wider mt-1">User Satisfaction</p>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {step === 'email' && "Get started with Prompt Pro"}
              {step === 'otp' && "Check your inbox"}
              {step === 'password' && (userExists ? "Welcome back" : "Secure your account")}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {step === 'email' && "Enter your email to sign in or create an account."}
              {step === 'otp' && `We sent a temporary code to ${email}`}
              {step === 'password' && (userExists ? "Enter your password to continue." : "Create a strong password to finish setup.")}
            </p>
          </div>

          {/* --- FORM STEP 1: EMAIL --- */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    type="email" 
                    placeholder="name@company.com" 
                    className="pl-10 h-12"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Continue"}
              </Button>
            </form>
          )}

          {/* --- FORM STEP 2: OTP (New Users) --- */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label>Verification Code</Label>
                <Input 
                  placeholder="123456" 
                  className="h-12 text-center text-2xl tracking-[0.5em] font-mono"
                  value={otpCode}
                  maxLength={6}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="
