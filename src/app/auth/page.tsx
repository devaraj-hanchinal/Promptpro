"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAppwriteAccount, ID } from "@/lib/appwrite";
import { Mail, Lock, ChevronLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AuthPage() {
  const router = useRouter();

  // Steps
  const [step, setStep] = useState<"checkEmail" | "signin" | "signup" | "otp" | "password">("checkEmail");

  // Form state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(false);

  // Password strength
  const passwordStrength = (() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ["Weak", "Medium", "Strong", "Excellent"][passwordStrength - 1] || "Too short";
  const strengthColor = ["#dc2626", "#ea580c", "#22c55e", "#0ea5e9"][passwordStrength - 1] || "#71717a";

  const account = getAppwriteAccount();

  const handleCheckEmail = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await account.getSession("current"); // if logged in already?
      router.push("/");
      return;
    } catch {}

    try {
      const res = await account.createEmailPasswordSession(email, "dummy");
      // will never work — just to detect existence
    } catch (err: any) {
      if (err.message.includes("Invalid credentials")) {
        setStep("signin"); // Email exists → signin
      } else {
        setStep("signup"); // Email does not exist → signup
      }
    }
    setLoading(false);
  };

  const handleSignup = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await account.create(ID.unique(), email, "temporaryPass123!", name);
      const token = await account.createEmailToken(email);
      setUid(token.userId);
      setStep("otp");
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await account.createSession(uid, otpCode);
      setStep("password");
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleCreatePassword = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newPassword = password;
      await account.updatePassword(newPassword);
      await account.updateEmail(email);
      await account.createEmailPasswordSession(email, newPassword);
      router.push("/");
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleSignin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await account.createEmailPasswordSession(email, password);
      router.push("/");
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  return (
    <div className="w-full min-h-screen flex bg-[#0a0a0a] text-neutral-200">

      {/* left hero */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between px-14 py-12 border-r border-neutral-800">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight">
            Prompt Pro
          </h1>
        </div>

        <div className="space-y-6">
          <h2 className="text-5xl font-semibold leading-tight text-white">
            Build better prompts.<br />Every day.
          </h2>
          <p className="text-neutral-400 text-lg max-w-md">
            Linear-inspired productivity for prompt engineering.
            Minimal UI, maximal output.
          </p>
        </div>

        <p className="text-neutral-500 text-sm">© PromptPro Inc.</p>
      </div>

      {/* right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8">
        <div className="w-full max-w-sm space-y-8">
          
          {/* back button */}
          {step !== "checkEmail" && (
            <button
              className="text-neutral-400 flex items-center gap-2"
              onClick={() => setStep("checkEmail")}
            >
              <ChevronLeft size={18} /> Back
            </button>
          )}

          {/* steps */}
          {step === "checkEmail" && (
            <form onSubmit={handleCheckEmail} className="space-y-5">
              <h2 className="text-2xl font-medium text-white">Welcome</h2>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  className="bg-neutral-900 border-neutral-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button className="w-full bg-white text-black hover:bg-neutral-100">
                {loading ? <Loader2 className="animate-spin" /> : "Continue"}
              </Button>
            </form>
          )}

          {step === "signin" && (
            <form onSubmit={handleSignin} className="space-y-5">
              <h2 className="text-2xl font-medium text-white">Sign in</h2>
              <p className="text-neutral-400 text-sm mb-3">{email}</p>

              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  className="bg-neutral-900 border-neutral-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button className="w-full bg-white text-black hover:bg-neutral-100">
                {loading ? <Loader2 className="animate-spin" /> : "Sign in"}
              </Button>
            </form>
          )}

          {step === "signup" && (
            <form onSubmit={handleSignup} className="space-y-5">
              <h2 className="text-2xl font-medium text-white">Create account</h2>
              <p className="text-neutral-400 text-sm mb-3">{email}</p>

              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  className="bg-neutral-900 border-neutral-800"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <Button className="w-full bg-white text-black hover:bg-neutral-100">
                {loading ? <Loader2 className="animate-spin" /> : "Send OTP"}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <h2 className="text-2xl font-medium text-white">Verify email</h2>
              <p className="text-neutral-400 text-sm mb-3">
                Enter the OTP sent to {email}
              </p>

              <Input
                className="bg-neutral-900 border-neutral-800"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
              />

              <Button className="w-full bg-white text-black hover:bg-neutral-100">
                {loading ? <Loader2 className="animate-spin" /> : "Verify"}
              </Button>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={handleCreatePassword} className="space-y-5">
              <h2 className="text-2xl font-medium text-white">Set password</h2>

              <Input
                type="password"
                className="bg-neutral-900 border-neutral-800"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* strength indicator */}
              <div className="h-1 w-full bg-neutral-800 rounded">
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${(passwordStrength / 4) * 100}%`,
                    backgroundColor: strengthColor,
                  }}
                />
              </div>
              <p className="text-neutral-400 text-sm">{strengthLabel}</p>

              <Button className="w-full bg-white text-black hover:bg-neutral-100">
                {loading ? <Loader2 className="animate-spin" /> : "Finish"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}





