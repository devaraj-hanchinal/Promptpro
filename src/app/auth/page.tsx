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
  Eye,
  EyeOff,
} from "lucide-react";

function AuthContent() {
  const router = useRouter();
  const { toast } = useToast();

  // ------------------ SCREEN STATES ------------------
  const [view, setView] = useState<
    "signIn" | "signUp" | "verifyOTP" | "setPassword"
  >("signIn");

  // ------------------ FORM FIELDS ------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [name, setName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ------------------ PASSWORD CHECKS ------------------
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);

  // ------------------ LOADING & TIMER ------------------
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  // ------------------ TIMER EFFECT ------------------
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isResendDisabled && resendTimer > 0) {
      interval = setInterval(
        () => setResendTimer((prev) => prev - 1),
        1000
      );
    }
    if (resendTimer === 0) {
      setIsResendDisabled(false);
    }

    return () => interval && clearInterval(interval);
  }, [isResendDisabled, resendTimer]);

  // --------------------------------------------------
  // 🔹 SIGN IN
  // --------------------------------------------------
  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const account = getAppwriteAccount();

      await account.createSession(email, password);

      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });

      router.push("/");
    } catch (err) {
      toast({
        title: "Account not found?",
        description: "Continuing to sign up",
      });
      setView("signUp");
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------
  // 🆕 SIGN UP → CREATE ACCOUNT + SEND OTP
  // --------------------------------------------------
  const handleSignup = async () => {
    setIsLoading(true);
    try {
      const account = getAppwriteAccount();
      const uid = ID.unique();

      // Create temp account with temp password
      await account.create(uid, email, tempPassword, name);

      localStorage.setItem("temp_uid", uid);
      localStorage.setItem("temp_signup_name", name);

      // Send OTP mail
      await account.createEmailToken(uid, email);

      toast({
        title: "OTP Sent 🚀",
        description: "Check your inbox",
      });

      setIsResendDisabled(true);
      setResendTimer(60);
      setView("verifyOTP");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------
  // 🔐 VERIFY OTP
  // --------------------------------------------------
  const handleVerifyOTP = async () => {
    setIsLoading(true);
    try {
      const account = getAppwriteAccount();
      const uid = localStorage.getItem("temp_uid");

      if (!uid) throw new Error("Session expired, signup again");

      // OTP verifies + logs user in
      await account.createSession(email, otpCode);

      toast({
        title: "Email verified 🎉",
        description: "Now create your password",
      });

      setView("setPassword");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------
  // 🔁 RESEND OTP
  // --------------------------------------------------
  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const account = getAppwriteAccount();
      const uid = localStorage.getItem("temp_uid");
      if (!uid) throw new Error("Session expired, signup again");

      await account.createEmailToken(uid, email);

      toast({
        title: "Sent again",
        description: "Check your inbox",
      });

      setIsResendDisabled(true);
      setResendTimer(60);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------
  // 🔑 SET PASSWORD
  // --------------------------------------------------
  const handleSetPassword = async () => {
    if (!hasMinLength || !hasNumber) return;

    setIsLoading(true);
    try {
      const account = getAppwriteAccount();
      const savedName = localStorage.getItem("temp_signup_name");

      await account.updatePassword(password);

      if (savedName) {
        await account.updateName(savedName);
        localStorage.removeItem("temp_signup_name");
      }

      toast({
        title: "Account Ready 🎉",
        description: "You can now start using Prompt Pro",
      });

      router.push("/");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==================================================
  //                     UI SCREENS
  // ==================================================

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-black">
      <div className="w-full max-w-md space-y-6">

        {/* Product Header */}
        <div className="flex justify-center mb-2">
          <span className="text-xs font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200 px-3 py-1 rounded-full">
            🚀 Prompt Pro — AI Prompt Optimization
          </span>
        </div>

        {/* Screen Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
          {view === "signIn" && "Sign In"}
          {view === "signUp" && "Create Account"}
          {view === "verifyOTP" && "Verify Email"}
          {view === "setPassword" && "Set Password"}
        </h2>

        {/* ---------- SIGN IN ---------- */}
        {view === "signIn" && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignIn();
            }}
          >
            <Input
              placeholder="Email"
              value={email}
              required
              type="email"
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative">
              <Input
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-gray-800"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </span>
            </div>

            <Button className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Continue"}
            </Button>

            <p className="text-center text-sm text-gray-500">
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

        {/* ---------- SIGN UP ---------- */}
        {view === "signUp" && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignup();
            }}
          >
            <Input
              placeholder="Full Name"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Email"
              value={email}
              required
              type="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="Temporary Password"
              value={tempPassword}
              required
              type="password"
              onChange={(e) => setTempPassword(e.target.value)}
            />

            <Button className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Send OTP"}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <button
                className="text-violet-600"
                onClick={() => setView("signIn")}
                type="button"
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {/* ---------- VERIFY OTP ---------- */}
        {view === "verifyOTP" && (
          <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <p className="text-center text-gray-500">
              Enter the code sent to:
              <span className="font-semibold text-gray-900 dark:text-gray-300">
                {" "}
                {email}
              </span>
            </p>

            <Input
              className="text-center tracking-widest text-xl font-semibold py-6 placeholder-gray-300 border-2 border-violet-200 dark:border-gray-700 focus:border-violet-600"
              placeholder="••••••"
              value={otpCode}
              maxLength={6}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
            />

            <Button className="w-full h-12 font-semibold" onClick={handleVerifyOTP}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Verify Code"}
            </Button>

            <div className="text-center text-sm">
              Didn’t receive it?{" "}
              {isResendDisabled ? (
                <span className="text-gray-400">
                  Resend in {resendTimer}s
                </span>
              ) : (
                <button className="text-violet-600"
                  onClick={handleResendOTP}>
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        {/* ---------- SET PASSWORD ---------- */}
        {view === "setPassword" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Label className="font-medium text-sm">Create your password</Label>

            <div className="relative">
              <Input
                placeholder="New Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-gray-800"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </span>
            </div>

            <div className="flex gap-1">
              {[hasMinLength, hasNumber].map((check, i) => (
                <div
                  key={i}
                  className={`h-2 w-full rounded-full transition-colors ${
                    check ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                />
              ))}
            </div>

            <Button
              className="w-full h-12 font-semibold"
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



