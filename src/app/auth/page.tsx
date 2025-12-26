"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { getAppwriteAccount, ID } from "@/lib/appwrite";
import { Loader2, ArrowLeft, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";

function AuthContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const storedUid = searchParams.get("uid");
  const [step, setStep] = useState<"signup" | "verifyOtp" | "setPassword" | "login">(
    storedUid ? "verifyOtp" : "signup"
  );

  const [userId, setUserId] = useState<string | null>(storedUid);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ------ RESEND OTP LOGIC ------
  const [resendTimer, setResendTimer] = useState(30);
  const [resendDisabled, setResendDisabled] = useState(true);

  useEffect(() => {
    if (!resendDisabled) return;
    if (resendTimer === 0) {
      setResendDisabled(false);
      return;
    }
    const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer, resendDisabled]);

  const sendOtp = async () => {
    try {
      const account = getAppwriteAccount();
      const newUid = ID.unique();
      setUserId(newUid);

      // ---- GENERATE A VALID INTERNAL PASSWORD ----
      const internalPass =
        crypto.randomUUID().replaceAll("-", "") +
        Math.random().toString(36).slice(-6);

      // must be stored temporarily for login after OTP
      localStorage.setItem("internal_pass", internalPass);
      localStorage.setItem("temp_signup_name", name);

      await account.create(newUid, email, internalPass);

      await account.createVerification(
        `${window.location.origin}/auth?uid=${newUid}`
      );

      toast({ title: "OTP sent!", description: "Check your email inbox." });
      setStep("verifyOtp");
      setResendDisabled(true);
      setResendTimer(30);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err?.message || "Unable to process signup. Email may already exist.",
      });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const account = getAppwriteAccount();
    setIsLoading(true);

    try {
      // ------ SIGNUP ------
      if (step === "signup") {
        await sendOtp();
      }

      // ------ VERIFY OTP ------
      else if (step === "verifyOtp") {
        if (!userId) throw new Error("Missing user reference");

        const internalPass = localStorage.getItem("internal_pass");
        if (!internalPass) throw new Error("Internal auth missing");

        await account.updateVerification(userId, otpCode);

        await account.createEmailPasswordSession(email, internalPass);

        toast({ title: "Email verified", description: "Now set your password." });

        const storedName = localStorage.getItem("temp_signup_name");
        if (storedName) setName(storedName);

        setStep("setPassword");
      }

      // ------ SET USER PASSWORD ------
      else if (step === "setPassword") {
        if (password.length < 8)
          throw new Error("Password must be at least 8 characters.");

        await account.updatePassword(password);

        const storedName = localStorage.getItem("temp_signup_name");
        if (storedName) {
          await account.updateName(storedName);
          localStorage.removeItem("temp_signup_name");
        }

        toast({ title: "Account ready!", description: "Welcome to Prompt Pro 🚀" });
        router.push("/");
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!email) return;
    await sendOtp();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {!storedUid && (
        <Link href="/" className="absolute top-6 left-6 text-gray-500 flex items-center">
          <ArrowLeft className="mr-1 w-4 h-4" /> Home
        </Link>
      )}

      {/* ---------- SIGNUP UI ---------- */}
      {step === "signup" && (
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
          <h2 className="text-3xl font-bold text-center">Create an account</h2>

          <div>
            <Label>Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                className="pl-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <Button disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Send OTP"}
          </Button>
        </form>
      )}

      {/* ---------- VERIFY OTP UI ---------- */}
      {step === "verifyOtp" && (
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5 text-center">
          <h2 className="text-3xl font-bold">Verify your email</h2>

          <Input
            placeholder="Enter OTP"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
          />

          <Button disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Verify OTP"}
          </Button>

          <p className="text-sm text-gray-500">
            Didn’t get code?{" "}
            {resendDisabled ? (
              <span className="opacity-60">Resend in {resendTimer}s</span>
            ) : (
              <button
                type="button"
                className="underline"
                onClick={resendOtp}
              >
                Resend
              </button>
            )}
          </p>
        </form>
      )}

      {/* ---------- SET PASSWORD UI ---------- */}
      {step === "setPassword" && (
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
          <h2 className="text-3xl font-bold text-center">Set a password</h2>

          <div>
            <Label>Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                className="pl-10 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <Button disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Continue"}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}




