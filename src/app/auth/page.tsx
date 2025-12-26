"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getAppwriteAccount, ID } from "@/lib/appwrite";
import { Loader2, Mail, Lock } from "lucide-react";

function AuthContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<"email" | "otp" | "password">("email");

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [uid, setUid] = useState("");

  const [name, setName] = useState("");
  const [userExists, setUserExists] = useState<boolean | null>(null);

  const [password, setPassword] = useState("");
  const [progress, setProgress] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  // Password strength calculator
  useEffect(() => {
    let p = 0;
    if (password.length >= 8) p += 25;
    if (/[A-Z]/.test(password)) p += 25;
    if (/[0-9]/.test(password)) p += 25;
    if (/[^A-Za-z0-9]/.test(password)) p += 25;
    setProgress(p);
  }, [password]);

  // Step 1: Check Email
  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;

    setIsLoading(true);
    const account = getAppwriteAccount();
    
    // Check if already logged in
    try {
      await account.get();
      router.push("/");
      return; 
    } catch {}

    // Check if user exists
    try {
      await account.createEmailPasswordSession(email, "CheckExists123!");
    } catch (err: any) {
      // 401 means password wrong (User Exists)
      // 404/others means User Not Found
      if (err?.code === 401 || err?.type === 'general_unauthorized_scope') {
         setUserExists(true);
      } else {
         setUserExists(false);
      }
    }

    setIsLoading(false);
  };

  // Handle transition after userExists check
  useEffect(() => {
    if (userExists === null) return;
    if (isLoading) return;

    const processStep = async () => {
      if (userExists) {
        setStep("password");
      } else {
        setIsLoading(true);
        try {
          const account = getAppwriteAccount();
          const newUser = await account.create(ID.unique(), email, "TempPass@123", name || "User");
          
          // IMPORTANT: Passing object { userId, email } as required by your SDK
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
          setUserExists(null);
        }
        setIsLoading(false);
      }
    };
    processStep();
  }, [userExists]);

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;

    setIsLoading(true);
    try {
      const account = getAppwriteAccount();
      await account.createSession(uid, otpCode); 
      
      setStep("password");
      toast({ title: "Verified", description: "Please set your password." });
    } catch (error) {
      toast({ variant: "destructive", title: "Invalid OTP", description: "Please try again." });
    }
    setIsLoading(false);
  };

  // Step 3: Set Password
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Login Flow
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

    // Signup Flow
    if (progress < 50) return toast({ title: "Weak Password", description: "Add more complexity." });

    setIsLoading(true);
    try {
      const account = getAppwriteAccount();
      await account.updatePassword(password);
      router.push("/");
    } catch (err) {
      toast({ variant: "destructive", title: "Error saving password" });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-[#0F172A] text-white p-12 relative">
        <div>
          <h1 className="text-5xl font-bold leading-snug">
            Level up your
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Prompting Skills.
            </span>
          </h1>
          <p className="mt-4 text-gray-300 max-w-md">
            Unlock advanced AI content creation workflows, boost productivity, and automate your creativity.
          </p>
        </div>

        <div className="text-sm text-gray-400 space-y-1">
          <p>✓ Trusted by thousands</p>
          <p>✓ Premium prompt library</p>
          <p>✓ Real results within weeks</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-10">
        <div className="w-full max-w-md space-y-8">

          {/* Email Form */}
          {step === "email" && (
            <form onSubmit={handleEmailCheck} className="space-y-4">
              <div className="space-y-2">
                <Label>Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    className="pl-10 h-11"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <Button className="w-full h-11" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Continue"}
              </Button>
            </form>
          )}

          {/* OTP Form */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center mb-4">
                  <h3 className="text-lg font-medium">Verify your email</h3>
                  <p className="text-sm text-gray-500">We sent a code to {email}</p>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    className="h-11 text-center text-lg tracking-widest"
                    value={otpCode}
                    placeholder="123456"
                    required
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                </div>
              </div>

              <Button className="w-full h-11" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Verify OTP"}
              </Button>
            </form>
          )}

          {/* Password Form */}
          {step === "password" && (
            <form onSubmit={handleSetPassword} className="space-y-5">
              <div className="space-y-2">
                <Label>{userExists ? "Enter your password" : "Create a password"}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    className="pl-10 h-11"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {!userExists && (
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progress}%`,
                        background:
                          progress < 50 ? "red" : progress < 75 ? "orange" : "green",
                      }}
                    />
                  </div>
              )}

              <Button className="w-full h-11" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : (userExists ? "Sign In" : "Finish & Log In")}
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
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin" /></div>}>
      <AuthContent />
    </Suspense>
  );
}


