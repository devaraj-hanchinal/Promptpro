"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getAppwriteAccount, ID } from "@/lib/appwrite";
import {
  Loader2,
  ArrowLeft,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

function AuthContent() {
  const { toast } = useToast();
  const router = useRouter();

  const [view, setView] = useState<"signIn" | "signUp" | "verifyOTP" | "setPassword">("signIn");
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Password checks
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);

  // OTP Timer state
  const [resendTimer, setResendTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  /* Countdown Timer */
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isResendDisabled && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    if (resendTimer === 0) {
      setIsResendDisabled(false);
    }
    return () => interval && clearInterval(interval);
  }, [isResendDisabled, resendTimer]);

  /* ❌ SIGN IN */
  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const account = getAppwriteAccount();
      await account.createSession(email, password);
      toast({ title: "Welcome back!", description: "Successfully signed in." });
      router.push("/");
    } catch (err) {
      toast({
        title: "Account not found?",
        description: "Continuing to sign up.",
      });
      setView("signUp");
    } finally {
      setIsLoading(false);
    }
  };

  /* 🆕 SIGN UP → SEND OTP */
  const handleSignup = async () => {
    setIsLoading(true);
    try {
      const account = getAppwriteAccount();
      const uid = ID.unique();

      await account.create(uid, email, password, name);
      localStorage.setItem("temp_uid", uid);
      localStorage.setItem("temp_signup_name", name);

      await account.createEmailToken(uid, email);

      toast({ title: "OTP Sent!", description: "Check your email." });
      setIsResendDisabled(true);
      setResendTimer(60);
      setView("verifyOTP");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  /* 🔐 VERIFY OTP */
  const handleVerifyOTP = async () => {
    setIsLoading(true);
    try {
      const account = getAppwriteAccount();
      const uid = localStorage.getItem("temp_uid");
      if (!uid) throw new Error("Signup expired. Try again.");

      await account.createSession(email, otpCode);
      setView("setPassword");

      toast({
        title: "Verified",
        description: "Your email has been confirmed.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* 🔑 SET PASSWORD */
  const handleSetPassword = async () => {
    if (!hasMinLength || !hasNumber) return;

    setIsLoading(true);
    try {
      const account = getAppwriteAccount();

      await account.updatePassword(password);
      const savedName = localStorage.getItem("temp_signup_name");
      if (savedName) {
        await account.updateName(savedName);
        localStorage.removeItem("temp_signup_name");
      }

      toast({ title: "Welcome!", description: "Account ready 🎉" });
      router.push("/");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  /* 🔁 RESEND OTP */
  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const account = getAppwriteAccount();
      const uid = localStorage.getItem("temp_uid");

      if (!uid) throw new Error("Session expired, signup again.");

      await account.createEmailToken(uid, email);
      toast({ title: "Sent again", description: "Please check your inbox." });

      setIsResendDisabled(true);
      setResendTimer(60);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to resend",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* UI Blocks */
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6">

        {/* Title */}
        <h2 className="text-2xl font-bold text-center">
          {view === "signIn" && "Sign In"}
          {view === "signUp" && "Create Account"}
          {view === "verifyOTP" && "Verify Email"}
          {view === "setPassword" && "Set Password"}
        </h2>

        {/* Sign In */}
        {view === "signIn" && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignIn();
            }}
          >
            <Input placeholder="Email" value={email} type="email" required onChange={(e) => setEmail(e.target.value)} />

            <div className="relative">
              <Input
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="absolute right-3 top-3 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </span>
            </div>

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Continue"}
            </Button>

            <p className="text-center text-sm">
              New here?{" "}
              <button
                className="text-violet-600"
                onClick={() => setView("signUp")}
                type="button"
              >
                Create Account
              </button>
            </p>
          </form>
        )}

        {/* Signup */}
        {view === "signUp" && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignup();
            }}
          >
            <Input placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Email" required value={email} type="email" onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Temporary Password" required type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Send OTP"}
            </Button>

            <p className="text-center text-sm">
              Already have an account?{" "}
              <button className="text-violet-600" onClick={() => setView("signIn")} type="button">
                Sign In
              </button>
            </p>
          </form>
        )}

        {/* OTP Verify */}
        {view === "verifyOTP" && (
          <div className="space-y-4">
            <Input placeholder="Enter OTP" value={otpCode} maxLength={6} onChange={(e) => setOtpCode(e.target.value)} />

            <Button className="w-full" onClick={handleVerifyOTP} disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Verify"}
            </Button>

            <div className="text-center text-sm">
              Didn’t get it?{" "}
              {isResendDisabled ? (
                <span className="text-gray-500">Resend in {resendTimer}s</span>
              ) : (
                <button className="text-violet-600" onClick={handleResendOTP}>
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        {/* Set Password */}
        {view === "setPassword" && (
          <div className="space-y-4">
            <Label>Password</Label>

            <div className="relative">
              <Input
                placeholder="New Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="absolute right-3 top-3 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff /> : <Eye />}
              </span>
            </div>

            {/* Password rules UI */}
            <div className="flex gap-4 text-xs">
              <span className={hasMinLength ? "text-green-600" : "text-gray-400"}>
                8+ characters
              </span>
              <span className={hasNumber ? "text-green-600" : "text-gray-400"}>
                Contains number
              </span>
            </div>

            <Button
              className="w-full"
              disabled={!hasMinLength || !hasNumber || isLoading}
              onClick={handleSetPassword}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Continue"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  );
}


