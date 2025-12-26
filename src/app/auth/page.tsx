"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getAppwriteAccount, ID } from "@/lib/appwrite";
import { Loader2, Mail, Lock, ArrowRight, User } from "lucide-react";

function AuthContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [isLoading, setIsLoading] = useState(false);
  
  // FORM DATA
  const [email, setEmail] = useState("");
  const [name, setName] = useState(""); 
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [uid, setUid] = useState(""); 
  
  const [userExists, setUserExists] = useState(false);
  const [passStrength, setPassStrength] = useState(0);

  // Password Strength Calculator
  useEffect(() => {
    let score = 0;
    if (password.length > 7) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    setPassStrength(score);
  }, [password]);

  // ---------------------------------------------------------
  // STEP 1: CHECK EMAIL
  // ---------------------------------------------------------
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;

    setIsLoading(true);
    const account = getAppwriteAccount();

    try {
      // Create user with generic name "User" (we update it later)
      const newUser = await account.create(ID.unique(), email, "TempPass@123", "User");
      
      // --- SUCCESS: NEW USER ---
      setUserExists(false);
      
      const token = await account.createEmailToken({
        userId: newUser.$id,
        email: email
      });

      setUid(token.userId);
      setStep("otp");
      toast({ title: "Account Created", description: "OTP sent to your email." });

    } catch (error: any) {
      // --- FAILURE: USER EXISTS ---
      if (error?.code === 409 || error?.type === 'user_already_exists') {
        setUserExists(true);
        setStep("password");
      } else {
        console.error(error);
        toast({ 
            variant: "destructive", 
            title: "Access Denied", 
            description: error.message || "Please wait a moment and try again." 
        });
      }
    }
    setIsLoading(false);
  };

  // ---------------------------------------------------------
  // STEP 2: VERIFY OTP
  // ---------------------------------------------------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const account = getAppwriteAccount();
      await account.createSession(uid, otpCode);
      
      setStep("password");
      toast({ title: "Verified!", description: "Now create your password." });
    } catch (error) {
      toast({ variant: "destructive", title: "Invalid Code", description: "Please try again." });
    }
    setIsLoading(false);
  };

  // ---------------------------------------------------------
  // STEP 3: FINAL SETUP (Name + Password)
  // ---------------------------------------------------------
  const handleFinalStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const account = getAppwriteAccount();

    try {
      if (userExists) {
        // --- EXISTING USER: JUST LOGIN ---
        await account.createEmailPasswordSession(email, password);
      } else {
        // --- NEW USER: UPDATE DETAILS ---
        if (passStrength < 50) {
            toast({ variant: "destructive", title: "Password too weak" });
            setIsLoading(false);
            return;
        }

        try {
          // 1. Update Name (Since we created them as "User" initially)
          if (name) await account.updateName(name);

          // 2. Update Password (Authorized by the temp password)
          await account.updatePassword(password, "TempPass@123");
        } catch (updateError) {
          // Recovery Mechanism
          console.warn("Session lost, recovering...", updateError);
          await account.createEmailPasswordSession(email, "TempPass@123");
          if (name) await account.updateName(name);
          await account.updatePassword(password, "TempPass@123");
        }
      }

      router.push("/");
      toast({ title: "Welcome to Prompt Pro!" });

    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      
      {/* LEFT SIDE: HEROICS */}
      <div className="hidden lg:flex w-1/2 bg-[#020617] relative overflow-hidden flex-col justify-between p-16 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

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

      {/* RIGHT SIDE: FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {step === 'email' && "Get started with Prompt Pro"}
              {step === 'otp' && "Check your inbox"}
              {step === 'password' && (userExists ? "Welcome back" : "Finish your profile")}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {step === 'email' && "Enter your email to sign in or create an account."}
              {step === 'otp' && `We sent a temporary code to ${email}`}
              {step === 'password' && (userExists ? "Enter your password to continue." : "Set your name and password.")}
            </p>
          </div>

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
              <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Verify Code"}
              </Button>
              <button 
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-sm text-gray-500 hover:text-gray-900 mt-4"
              >
                Change email address
              </button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleFinalStep} className="space-y-6">
              
              {/* NAME FIELD (Only for New Users) */}
              {!userExists && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="John Doe" 
                      className="pl-10 h-12"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>{userExists ? "Password" : "Create Password"}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {!userExists && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Password strength</span>
                    <span>{passStrength < 50 ? "Weak" : passStrength < 75 ? "Good" : "Strong"}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        passStrength < 50 ? "bg-red-500" : passStrength < 75 ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      style={{ width: `${passStrength}%` }}
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full h-12 text-base bg-violet-600 hover:bg-violet-700" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : (
                  <span className="flex items-center">
                    {userExists ? "Sign In" : "Finish Setup"} <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <AuthContent />
    </Suspense>
  );
}
