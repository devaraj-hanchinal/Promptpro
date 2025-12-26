"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { account, ID } from "@/lib/appwrite";

function AuthContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<"signup" | "otp" | "password">("signup");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");

  // resend otp
  const [timer, setTimer] = useState(0);
  const [disableResend, setDisableResend] = useState(false);

  const uid = typeof window !== "undefined" ? localStorage.getItem("otp_uid") : null;

  // ----------------- PASSWORD STRENGTH ------------------
  const hasMin = password.length >= 8;
  const hasNum = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const strengthScore = [hasMin, hasNum, hasUpper].filter(Boolean).length;

  const strengthLabel =
    strengthScore === 1 ? "Weak" : strengthScore === 2 ? "Medium" : strengthScore === 3 ? "Strong" : "Too weak";

  // ------------------- TIMER RESEND ----------------------
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (disableResend && timer > 0) {
      interval = setInterval(() => {
        setTimer((x) => x - 1);
      }, 1000);
    }

    if (timer <= 0 && disableResend) {
      setDisableResend(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [disableResend, timer]);

  // --------------------- SEND OTP ------------------------
  const handleSignup = async (e: any) => {
    e.preventDefault();

    try {
      // --- Create OTP Token ---
      const otpRes = await account.createEmailToken({
        userId: ID.unique(),
        email: email,
      });

      // --- Create user with random temp password ---
      const tempPassword = ID.unique();
      await account.create(otpRes.userId, email, tempPassword, name);

      localStorage.setItem("otp_uid", otpRes.userId);
      localStorage.setItem("temp_name", name);
      localStorage.setItem("temp_email", email);

      setStep("otp");
      toast({ title: "OTP Sent!", description: `Check your inbox at ${email}` });

      setDisableResend(true);
      setTimer(30);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: err.message || "Something went wrong",
      });
    }
  };

  // --------------------- VERIFY OTP ----------------------
  const handleOtpVerify = async (e: any) => {
    e.preventDefault();

    try {
      if (!uid) throw new Error("User session expired. Signup again.");

      await account.createSession(uid, otpCode);
      setStep("password");

      toast({ title: "OTP Verified", description: "Set a password to continue" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: err.message,
      });
    }
  };

  // ------------------ SET FINAL PASSWORD -----------------
  // ------------------ SET FINAL PASSWORD -----------------
const handlePasswordSet = async (e: any) => {
  e.preventDefault();

  try {
    if (!hasMin || !hasNum || !hasUpper)
      throw new Error("Password must be strong (8 chars, 1 number, 1 uppercase)");

    await account.updatePassword(password);

    const savedName = localStorage.getItem("temp_name");

    // ✨ keep ONLY name update — email doesn't need updating
    if (savedName) await account.updateName(savedName);

    localStorage.removeItem("otp_uid");
    localStorage.removeItem("temp_name");
    localStorage.removeItem("temp_email");

    toast({ title: "Account Ready!", description: "Welcome to Prompt Pro" });
    window.location.href = "/";
  } catch (err: any) {
    toast({ variant: "destructive", title: "Error", description: err.message });
  }
};

  // -------------------------------------------------------
  // ------------------------- UI --------------------------
  // -------------------------------------------------------

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <Link href="/" className="flex items-center gap-1 text-gray-500">
        <ArrowLeft size={18} /> Home
      </Link>

      {/* ---------------- SIGNUP FORM ---------------- */}
      {step === "signup" && (
        <form
          onSubmit={handleSignup}
          className="w-full max-w-md bg-white p-8 shadow rounded-lg space-y-6 mt-6"
        >
          <h2 className="text-3xl font-bold text-center">Create an account</h2>

          <div>
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setStep("signup"); // if user changes email from error state
              }}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Send OTP
          </Button>
        </form>
      )}

      {/* ---------------- OTP FORM ---------------- */}
      {step === "otp" && (
        <form
          onSubmit={handleOtpVerify}
          className="w-full max-w-md bg-white p-8 shadow rounded-lg space-y-6 mt-6"
        >
          <h2 className="text-3xl font-bold text-center">Verify your email</h2>
          <p className="text-center text-gray-600">Enter the code sent to: <b>{email}</b></p>

          <Input
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            required
          />

          <Button type="submit" className="w-full">
            Verify OTP
          </Button>

          <p className="text-center text-gray-500">
            Didn't get code?
            {disableResend ? (
              <span className="ml-2 text-gray-400">Resend {timer}s</span>
            ) : (
              <button
                type="button"
                className="ml-2 underline"
                onClick={handleSignup}
              >
                Resend
              </button>
            )}
          </p>
        </form>
      )}

      {/* ---------------- PASSWORD FORM ---------------- */}
      {step === "password" && (
        <form
          onSubmit={handlePasswordSet}
          className="w-full max-w-md bg-white p-8 shadow rounded-lg space-y-6 mt-6"
        >
          <h2 className="text-3xl font-bold text-center">Secure your account</h2>

          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Strength bar */}
          <div className="flex gap-2 text-sm">
            <span className={hasMin ? "text-green-600" : "text-gray-400"}>8+ chars</span>
            <span className={hasNum ? "text-green-600" : "text-gray-400"}>number</span>
            <span className={hasUpper ? "text-green-600" : "text-gray-400"}>uppercase</span>
          </div>

          <Button className="w-full" type="submit">
            Save Password
          </Button>
        </form>
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin" size={32} />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}




