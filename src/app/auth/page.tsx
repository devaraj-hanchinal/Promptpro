"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getAppwriteAccount, ID } from "@/lib/appwrite";
import { ArrowLeft, Loader2, Lock, Mail, User, Eye, EyeOff, Check } from "lucide-react";

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>}>
      <AuthContent />
    </Suspense>
  );
}

function AuthContent() {
  const [step, setStep] = useState<"signup" | "otp" | "password">("signup");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [resendTimer, setResendTimer] = useState(30);
  const [resendDisabled, setResendDisabled] = useState(false);

  // Password Strength Rules
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordValid = minLength && hasUpper && hasNumber;

  // Resend timer logic
  useEffect(() => {
    if (!resendDisabled) return;
    if (resendTimer <= 0) {
      setResendTimer(30);
      setResendDisabled(false);
      return;
    }
    const interval = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(interval);
  }, [resendDisabled, resendTimer]);

  const handleSendOTP = async () => {
    setIsLoading(true);
    const account = getAppwriteAccount();

    try {
      // 🔹 Try login (if email exists)
      const testPassword = ID.unique();
      await account.createEmailPasswordSession(email, testPassword);

      // ✔ Existing account
      toast({ title: "Welcome back!", description: "Login instead." });
      return router.push("/auth?signin=true");
    } catch {
      // Creating a temporary random password
      const tempPassword = ID.unique();

      try {
        await account.create(ID.unique(), email, tempPassword, name);

        const otpRes = await account.createEmailToken(email);
        localStorage.setItem("otp_uid", otpRes.userId);
        localStorage.setItem("temp_name", name);

        setStep("otp");
        toast({ title: "OTP Sent", description: "Check your inbox." });
        setResendDisabled(true);
      } catch (error: any) {
        toast({ variant: "destructive", title: "Signup Failed", description: error.message });
      }
    }

    setIsLoading(false);
  };

  const handleVerifyOTP = async () => {
    setIsLoading(true);
    const account = getAppwriteAccount();
    const uid = localStorage.getItem("otp_uid");

    if (!uid) {
      toast({ variant: "destructive", title: "Error", description: "Session expired. Please sign up again." });
      return location.reload();
    }

    try {
      await account.createEmailSession(uid, otpCode);
      setStep("password");
      toast({ title: "Email Verified", description: "Now set a password" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Invalid OTP", description: "Try again." });
    }
    setIsLoading(false);
  };

  const handleSetPassword = async () => {
    if (!passwordValid) {
      toast({ variant: "destructive", title: "Weak Password", description: "Follow password rules." });
      return;
    }

    setIsLoading(true);
    const account = getAppwriteAccount();
    const storedName = localStorage.getItem("temp_name");

    try {
      await account.updatePassword(password);
      if (storedName) await account.updateName(storedName);

      localStorage.removeItem("temp_name");
      localStorage.removeItem("otp_uid");

      toast({ title: "Account Ready!", description: "Redirecting..." });
      router.push("/");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">

      {/* ---------------- SIGNUP SCREEN ---------------- */}
      {step === "signup" && (
        <form className="max-w-md w-full space-y-5" onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }}>
          <Link href="/" className="text-sm text-gray-500 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>

          <h2 className="text-2xl font-bold">Create an account</h2>

          <div className="space-y-1">
            <Label>Full Name</Label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input value={name} onChange={(e) => setName(e.target.value)} required className="pl-10" />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Email</Label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
            </div>
          </div>

          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Send OTP"}
          </Button>
        </form>
      )}

      {/* ---------------- OTP SCREEN ---------------- */}
      {step === "otp" && (
        <div className="max-w-md w-full space-y-5 text-center">
          <h2 className="text-2xl font-bold">Verify your email</h2>
          <p className="text-gray-500">Enter OTP sent to: <b>{email}</b></p>

          <Input maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="text-center text-xl" />

          <Button disabled={isLoading} onClick={handleVerifyOTP} className="w-full">
            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Verify OTP"}
          </Button>

          <p className="text-sm text-gray-500">
            Didn’t get code?{" "}
            {resendDisabled ? (
              <span className="text-gray-400">{resendTimer}s</span>
            ) : (
              <button onClick={handleSendOTP} className="underline text-violet-600">
                Resend
              </button>
            )}
          </p>
        </div>
      )}

      {/* ---------------- PASSWORD SCREEN ---------------- */}
      {step === "password" && (
        <div className="max-w-md w-full space-y-5 text-center">
          <h2 className="text-2xl font-bold">Set Password</h2>

          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength Rules */}
          <div className="space-y-1 text-left text-sm">
            <div className={`flex items-center gap-2 ${minLength ? "text-green-600" : "text-gray-400"}`}>
              <Check className="w-4 h-4" /> 8+ characters
            </div>
            <div className={`flex items-center gap-2 ${hasUpper ? "text-green-600" : "text-gray-400"}`}>
              <Check className="w-4 h-4" /> 1 uppercase
            </div>
            <div className={`flex items-center gap-2 ${hasNumber ? "text-green-600" : "text-gray-400"}`}>
              <Check className="w-4 h-4" /> 1 number
            </div>
          </div>

          <Button
            disabled={!passwordValid || isLoading}
            onClick={handleSetPassword}
            className="w-full"
          >
            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Finish & Login"}
          </Button>
        </div>
      )}

    </div>
  );
}





