"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getAppwriteAccount, ID } from "@/lib/appwrite";
import {
  Wand2, Loader2, ArrowLeft, ArrowRight,
  Mail, Lock, User, Eye, EyeOff
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function AuthContent() {
  const [view, setView] = useState<
    "signIn" | "signUp" | "magicSent" | "otpVerify" | "setPassword"
  >("signIn");

  const [isLoading, setIsLoading] = useState(false);

  // form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const { toast } = useToast();
  const router = useRouter();

  // password validation
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);

  /* -------------------------------------------------
      HANDLE MAGIC LINK VERIFICATION
  ---------------------------------------------------*/
  useEffect(() => {
    const handleMagic = async () => {
      if (userId && secret) {
        setIsLoading(true);
        try {
          const account = getAppwriteAccount();
          await account.updateMagicURLSession(userId, secret);

          toast({
            title: "Email Verified!",
            description: "Now secure your account with a password.",
          });

          const savedName = localStorage.getItem("temp_signup_name");
          if (savedName) setName(savedName);

          setView("setPassword");
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Invalid or expired link",
            description: "Try signing up again.",
          });
          setView("signIn");
        } finally {
          setIsLoading(false);
        }
      }
    };
    handleMagic();
  }, [userId, secret, toast]);

  /* -------------------------------------------------
                HANDLE SUBMIT FLOWS
  ---------------------------------------------------*/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const account = getAppwriteAccount();

      /* ---------- SIGN IN (auto redirect to sign up if user not found) ---------- */
      if (view === "signIn") {
        try {
          await account.createEmailPasswordSession(email, password);
          toast({ title: "Welcome back!", description: "Logged in successfully." });
          window.location.href = "/";
        } catch {
          toast({
            title: "Account not found",
            description: "Switched to Sign Up — verify your email to continue.",
            duration: 6000,
          });
          setView("signUp");
        }
      }

      /* ---------- SIGN UP (create user + send OTP + send link) ---------- */
      else if (view === "signUp") {
        const newUserId = ID.unique();
        localStorage.setItem("temp_signup_uid", newUserId);
        localStorage.setItem("temp_signup_name", name);

        const tempPassword = ID.unique(); // temporary password to create user
        await account.create(newUserId, email, tempPassword, name);

        const redirectUrl = `${window.location.origin}/auth`;
        await account.createVerification(redirectUrl);   // magic link
        await account.createEmailToken(newUserId, email); // OTP

        toast({
          title: "Verify your email",
          description: "We sent a magic link AND a 6-digit OTP. Use either to continue.",
          duration: 8000,
        });

        setView("otpVerify");
      }

      /* ---------- OTP VERIFY ---------- */
      /* ---------- OTP VERIFY ---------- */
else if (view === "otpVerify") {
  try {
    const uid = localStorage.getItem("temp_signup_uid");
    if (!uid) throw new Error("User session expired. Please sign up again.");

    // FIX: correct OTP verification method for Appwrite 1.x
    await account.createSession(uid, otpCode);

    const storedName = localStorage.getItem("temp_signup_name");
    if (storedName) {
      await account.updateName(storedName);
      localStorage.removeItem("temp_signup_name");
    }

    toast({
      title: "Email verified via OTP!",
      description: "Now create a password to secure your account.",
    });

    setView("setPassword");
  } catch (err: any) {
    toast({
      variant: "destructive",
      title: "Incorrect OTP",
      description: "Try again or check your email.",
    });
  }
}


      /* ---------- SET PASSWORD ---------- */
      else if (view === "setPassword") {
        if (!hasMinLength || !hasNumber)
          throw new Error("Password must have 8+ characters and include a number.");

        await account.updatePassword(password);

        toast({
          title: "Account secured!",
          description: "Please log in.",
        });

        window.location.href = "/auth";
      }
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

  /* -------------------------------------------------
                        UI
  ---------------------------------------------------*/

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-gray-900">

      {/* LEFT SIDE — branding */}
      <div className="hidden lg:flex w-1/2 bg-[#0F172A] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col justify-between w-full h-full p-12">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-violet-400" />
            <span className="font-bold text-lg">Prompt Pro</span>
          </div>

          <h1 className="text-5xl font-bold leading-[1.15]">
            Stop struggling with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              AI Prompts.
            </span>
          </h1>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl max-w-md text-sm">
            "Rewrite this AI prompt better"
          </div>
        </div>
      </div>

      {/* RIGHT SIDE — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px] space-y-8">

          {view !== "magicSent" && (
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Link>
          )}

          <div className="space-y-1.5">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {view === "signIn" && "Welcome back"}
              {view === "signUp" && "Create an account"}
              {view === "otpVerify" && "Verify code"}
              {view === "setPassword" && "Secure your account"}
            </h2>
          </div>

          {/* MAIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* NAME */}
            {(view === "signUp" || view === "setPassword") && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={view === "signUp"}
                />
              </div>
            )}

            {/* EMAIL */}
            {(view === "signUp" || view === "signIn") && (
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}

            {/* OTP */}
            {view === "otpVerify" && (
              <div className="space-y-2">
                <Label>Enter OTP</Label>
                <Input value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
            )}

            {/* PASSWORD */}
            {(view === "signIn" || view === "setPassword") && (
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              ) : (
                <>
                  {view === "signIn" && <>Sign In <ArrowRight className="ml-2 w-4 h-4"/></>}
                  {view === "signUp" && "Verify Email"}
                  {view === "otpVerify" && "Verify OTP"}
                  {view === "setPassword" && "Create Password"}
                </>
              )}
            </Button>
          </form>

          {/* SWITCH VIEW */}
          {view !== "setPassword" && view !== "otpVerify" && (
            <div className="text-sm text-center">
              {view === "signUp" ? "Already have an account?" : "New to Prompt Pro?"}
              <button
                className="font-semibold text-violet-600 ml-1"
                onClick={() => setView(view === "signUp" ? "signIn" : "signUp")}
              >
                {view === "signUp" ? "Sign In" : "Create Account"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}


