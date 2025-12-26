"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getAppwriteAccount, ID } from "@/lib/appwrite";
import { Wand2, Mail, Lock, User, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

function AuthContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<
    "email" | "signin" | "signup" | "otp" | "password"
  >("email");

  const [email, setEmail] = useState("");
  const [uid, setUid] = useState("");
  const [name, setName] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  // resend OTP timer
  const [resendTimer, setResendTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  // strength meter
  useEffect(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/\d/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setStrength(score);
  }, [password]);

  // resend timer effect
  useEffect(() => {
    if (!isResendDisabled) return;
    if (resendTimer === 0) {
      setIsResendDisabled(false);
      return;
    }
    const interval = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [isResendDisabled, resendTimer]);

  /* ---------------------------------------
     STEP 1: CHECK EMAIL EXISTS
  --------------------------------------- */
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const account = getAppwriteAccount();
      await account.createSession(email, "wrong-pass"); // always fails; used for exists check
      setStep("signin");
    } catch (err: any) {
      if (err.code === 401) {
        setStep("signin");
      } else {
        setStep("signup");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------
     SIGN IN (PASSWORD)
  --------------------------------------- */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const account = getAppwriteAccount();
      await account.createEmailPasswordSession(email, password);
      router.push("/");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Login failed" });
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------
     SIGN UP → CREATE USER → SEND OTP
  --------------------------------------- */
  const handleSignUpStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newUserId = ID.unique();
      const account = getAppwriteAccount();

      await account.create(newUserId, email, "Temp@1234", name);

      setUid(newUserId);

      await account.createEmailToken({ userId: newUserId, email });

      setStep("otp");
      setResendTimer(30);
      setIsResendDisabled(true);

      toast({ title: "OTP Sent", description: "Check your inbox" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Signup failed" });
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------
     VERIFY OTP → PROCEED TO PASSWORD
  --------------------------------------- */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const account = getAppwriteAccount();
      await account.createEmailSession({ userId: uid, secret: otpCode });
      setStep("password");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Invalid OTP" });
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------
     SET PASSWORD → UPDATE EMAIL → LOGIN
  --------------------------------------- */
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const account = getAppwriteAccount();

      await account.updatePassword(password);

      await account.updateEmail({ email, password });

      await account.createEmailPasswordSession(email, password);

      router.push("/");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Account setup failed" });
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------
       UI COMPONENTS
  --------------------------------------- */

  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];

  return (
    <div className="min-h-screen w-full flex bg-[#0c0c0c] text-gray-100">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 border-r border-gray-800">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <Wand2 className="text-purple-400" /> Prompt Pro
        </div>

        <div>
          <h1 className="text-5xl font-bold mb-6">
            Ship prompts like<br />
            <span className="text-purple-400">a power-user.</span>
          </h1>
          <p className="text-gray-400 max-w-md">
            Optimize, refine & manage your AI prompts with blazing speed.
          </p>
        </div>

        <p className="text-gray-500 text-sm">© Prompt Pro — Linear-inspired UI</p>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-10">
        <div className="w-full max-w-sm space-y-8">

          {/* EMAIL */}
          {step === "email" && (
            <form onSubmit={handleCheckEmail} className="space-y-4">
              <Label>Email</Label>
              <Input
                className="bg-[#1a1a1a] border-gray-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                {isLoading ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight /></>}
              </Button>
            </form>
          )}

          {/* SIGN IN */}
          {step === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <Label>Password</Label>
              <Input
                type="password"
                className="bg-[#1a1a1a] border-gray-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                {isLoading ? <Loader2 className="animate-spin" /> : <>Login <ArrowRight /></>}
              </Button>
            </form>
          )}

          {/* SIGN UP */}
          {step === "signup" && (
            <form onSubmit={handleSignUpStart} className="space-y-4">
              <Label>Name</Label>
              <Input
                className="bg-[#1a1a1a] border-gray-700"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                {isLoading ? <Loader2 className="animate-spin" /> : <>Send OTP <ArrowRight /></>}
              </Button>
            </form>
          )}

          {/* OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <Label>Enter OTP sent to {email}</Label>
              <Input
                className="bg-[#1a1a1a] border-gray-700"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
              />

              <Button disabled={isResendDisabled} variant="outline"
                onClick={async () => {
                  const account = getAppwriteAccount();
                  await account.createEmailToken({ userId: uid, email });
                  setResendTimer(30);
                  setIsResendDisabled(true);
                }}>
                {isResendDisabled ? `Resend in ${resendTimer}s` : "Resend OTP"}
              </Button>

              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                {isLoading ? <Loader2 className="animate-spin" /> : <>Verify <ArrowRight /></>}
              </Button>
            </form>
          )}

          {/* PASSWORD */}
          {step === "password" && (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <Label>Create password</Label>
              <Input
                type="password"
                className="bg-[#1a1a1a] border-gray-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* strength bar */}
              <div className="flex gap-1 mt-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 w-full rounded ${
                      strength > i ? strengthColors[i] : "bg-gray-700"
                    }`}
                  />
                ))}
              </div>

              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                {isLoading ? <Loader2 className="animate-spin" /> : <>Finish <ShieldCheck /></>}
              </Button>
            </form>
          )}

          <div className="text-center">
            <Link href="/" className="text-gray-500 hover:text-gray-300 text-xs">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div />}>
      <AuthContent />
    </Suspense>
  );
}





