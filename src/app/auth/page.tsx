"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getAppwriteAccount, ID } from "@/lib/appwrite";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";

function AuthContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState("");
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
  // STEP 1: SMART EMAIL CHECK (Rate Limit Safe)
  // ---------------------------------------------------------
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;

    setIsLoading(true);
    const account = getAppwriteAccount();

    try {
      // STRATEGY: Try to create a NEW user first.
      // If they exist, this line throws a specific error (409).
      const newUser = await account.create(ID.unique(), email, "TempPass@123", "User");
      
      // --- SUCCESS: USER IS NEW ---
      setUserExists(false);
      
      // Send OTP to verify this new account
      const token = await account.createEmailToken({
        userId: newUser.$id,
        email: email
      });

      setUid(token.userId);
      setStep("otp");
      toast({ title: "Account Created", description: "OTP sent to your email." });

    } catch (error: any) {
      // --- FAILURE: CHECK IF USER EXISTS ---
      if (error?.code === 409 || error?.type === 'user_already_exists') {
        // Error 409 means "Conflict: User already exists"
        // This is GOOD! It means we just need to log them in.
        setUserExists(true);
        setStep("password");
      } else {
        // Real Error (e.g. Rate Limit still active from before)
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
  // STEP 2: VERIFY OTP (Only for New Users)
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
  // STEP 3: FINAL LOGIN / PASSWORD SET
  // ---------------------------------------------------------
  const handleFinalStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const account = getAppwriteAccount();

    try {
      if (userExists) {
        // --- EXISTING USER: LOGIN ---
        await account.createEmailPasswordSession(email, password);
      } else {
        // --- NEW USER: SET PASSWORD ---
        if (passStrength < 50) {
            toast({ variant: "destructive", title: "Password too weak" });
            setIsLoading(false);
            return;
        }
        // We are already logged in via OTP, so just update password
        await account.updatePassword(password);
      }

      router.push("/");
      toast({ title: "Welcome to Prompt Pro!" });

    } catch (error: any) {
      // Handle "Invalid Credentials" for existing users
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
              {step === 'password' && (userExists ? "Welcome back" : "Secure your account")}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {step === 'email' && "Enter your email to sign in or create an account."}
              {step === 'otp' && `We sent a temporary code to ${email}`}
              {step === 'password' && (userExists ? "Enter your password to continue." : "Create a strong password to finish setup.")}
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
