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
  Wand2, Loader2, ArrowLeft, Star, Mail, Lock, User, Eye, EyeOff, ArrowRight
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function AuthContent() {
  const [view, setView] = useState<"signIn" | "signUp" | "otpVerify" | "setPassword">("signIn");
  const [isLoading, setIsLoading] = useState(false);

  // fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const searchParams = useSearchParams();
  const queryUserId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const router = useRouter();
  const { toast } = useToast();

  // password validation
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);

  /** ---------------------------------
   * HANDLE MAGIC LINK RETURN
   * --------------------------------- */
  useEffect(() => {
    const handleMagicLink = async () => {
      if (queryUserId && secret) {
        setIsLoading(true);
        try {
          const account = getAppwriteAccount();
          await account.updateMagicURLSession(queryUserId, secret);

          const storedName = localStorage.getItem("temp_signup_name");
          if (storedName) setName(storedName);

          toast({
            title: "Email Verified via Link!",
            description: "Now secure your account with a password."
          });

          setView("setPassword");
        } catch (err) {
          console.error(err);
          toast({
            variant: "destructive",
            title: "Invalid or Expired Link",
            description: "Try verifying again."
          });
          setView("signIn");
        } finally {
          setIsLoading(false);
        }
      }
    };
    handleMagicLink();
  }, [queryUserId, secret]);

  /** ---------------------------------
   * OTP auto box movement
   * --------------------------------- */
  const handleOtpChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return; // allow only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextBox = document.getElementById(`otp-${index + 1}`);
      nextBox?.focus();
    }
    if (!value && index > 0) {
      const prevBox = document.getElementById(`otp-${index - 1}`);
      prevBox?.focus();
    }
  };

  const otpCode = otp.join("");

  /** ---------------------------------
   * HANDLE SUBMIT
   * --------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const account = getAppwriteAccount();

      /** ------ SIGN IN ------ */
      if (view === "signIn") {
        try {
          await account.createEmailPasswordSession(email, password);
          toast({ title: "Welcome back!", description: "Logged in successfully." });
          window.location.href = "/";
        } catch (err: any) {
          console.log("Sign-in failed:", err.message);

          // ⭐ Auto redirect to sign up when unknown email
          if (
            err.message?.toLowerCase().includes("invalid credentials") ||
            err.message?.toLowerCase().includes("user not found") ||
            err.code === 401
          ) {
            toast({
              title: "No account found",
              description: "We've pre-filled your email — continue to sign up.",
              duration: 5000
            });
            setView("signUp");
            return;
          }

          toast({
            variant: "destructive",
            title: "Error",
            description: err.message || "Unable to sign in."
          });
        }
      }

      /** ------ SIGN UP (create user + send OTP + send link) ------ */
      else if (view === "signUp") {
        const userId = ID.unique();
        localStorage.setItem("temp_signup_uid", userId);
        localStorage.setItem("temp_signup_name", name);

        await account.create(userId, email);

        const redirectUrl = `${window.location.origin}/auth`;
        await account.createVerification(redirectUrl);   // magic link
        await account.createEmailToken(userId, email);   // otp

        toast({
          title: "Check your email",
          description: "We've sent a magic link and a 6-digit OTP — use either to verify.",
          duration: 7000
        });

        setView("otpVerify");
      }

      /** ------ OTP VERIFY ------ */
      else if (view === "otpVerify") {
        const userId = localStorage.getItem("temp_signup_uid");

        if (!userId) throw new Error("Sign-up session missing. Try again.");
        if (otpCode.length !== 6)
          return toast({ variant: "destructive", title: "Invalid OTP", description: "Enter 6 digits." });

        try {
          await account.updateEmailSession(userId, otpCode);

          const storedName = localStorage.getItem("temp_signup_name");
          if (storedName) setName(storedName);

          toast({ title: "OTP Verified!", description: "Now create a password." });
          setView("setPassword");
        } catch {
          toast({
            variant: "destructive",
            title: "Invalid OTP",
            description: "Try again or use the link in your email."
          });
        }
      }

      /** ------ SET PASSWORD ------ */
      else if (view === "setPassword") {
        if (!hasMinLength || !hasNumber)
          throw new Error("Password must have 8+ characters and include a number.");

        const finalName = name || localStorage.getItem("temp_signup_name");

        await account.updatePassword(password);
        if (finalName) {
          await account.updateName(finalName);
          localStorage.removeItem("temp_signup_name");
        }

        await account.createEmailPasswordSession(email, password);

        localStorage.removeItem("temp_signup_uid");

        toast({ title: "Account Created!", description: "Welcome to Prompt Pro 🎉" });
        window.location.href = "/";
      }

    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Something went wrong."
      });
    } finally {
      setIsLoading(false);
    }
  };

  /** ---------------------------------
   * OTP UI Component
   * --------------------------------- */
  const OtpInputs = () => (
    <div className="flex justify-between gap-2 pt-2">
      {otp.map((digit, i) => (
        <Input
          key={i}
          id={`otp-${i}`}
          maxLength={1}
          className="w-10 h-12 text-center text-lg font-semibold"
          value={digit}
          onChange={(e) => handleOtpChange(e.target.value, i)}
        />
      ))}
    </div>
  );

  /** ---------------------------------
   * UI
   * --------------------------------- */
  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-gray-900">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#0F172A] text-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col justify-between w-full h-full p-12">

          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-lg border border-white/10">
              <Wand2 className="w-5 h-5 text-violet-400" />
            </div>
            <span className="font-bold text-lg">Prompt Pro</span>
          </div>

          <div className="space-y-8">
            <h1 className="text-5xl font-bold leading-[1.15]">
              Stop struggling with <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                AI Prompts.
              </span>
            </h1>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl max-w-md">
              <p className="text-xs opacity-80">Optimization transforms:</p>
              <p className="text-xs opacity-70 line-through mt-1">
                “Write a blog about coffee.”
              </p>
              <p className="text-xs opacity-95 mt-1">
                “Write a comprehensive SEO-optimized blog about coffee brewing techniques...”
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <Avatar key={i} className="border-2 border-[#0F172A] w-10 h-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} />
                    <AvatarFallback>U{i}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-sm opacity-80 mt-1">
                  Trusted by <span className="text-white font-medium">12,000+ creators</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-6 text-xs opacity-60 font-medium">
            <span>© Prompt Pro Inc.</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px] space-y-8">

          {view !== "otpVerify" && view !== "setPassword" && (
            <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Link>
          )}

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {view === "signIn" && "Welcome back"}
            {view === "signUp" && "Create an account"}
            {view === "otpVerify" && "Verify your email"}
            {view === "setPassword" && "Secure your account"}
          </h2>

          {view === "otpVerify" && (
            <p className="text-gray-500 dark:text-gray-400">
              We sent a <strong>6-digit OTP</strong> and a <strong>magic link</strong>.<br/>
              Use whichever method you like to verify.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* SIGN IN / SIGN UP */}
            {(view === "signIn" || view === "signUp") && (
              <>
                {view === "signUp" && (
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input required value={name} onChange={(e) => setName(e.target.value)} className="pl-10 h-11" />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                {view === "signIn" && (
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* OTP VIEW */}
            {view === "otpVerify" && <OtpInputs />}

            {/* SET PASSWORD */}
            {view === "setPassword" && (
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>

                <div className="flex gap-4 text-xs mt-1">
                  <span className={hasMinLength ? "text-green-600" : "text-gray-400"}>✔ 8+ chars</span>
                  <span className={hasNumber ? "text-green-600" : "text-gray-400"}>✔ number</span>
                </div>
              </div>
            )}

            {/* SUBMIT */}
            <Button disabled={isLoading} type="submit" className="w-full h-11 bg-violet-600 hover:bg-violet-700">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : view === "signIn" ? (
                <span className="flex items-center">Sign In <ArrowRight className="ml-2 w-4 h-4" /></span>
              ) : view === "signUp" ? (
                "Continue"
              ) : view === "otpVerify" ? (
                "Verify"
              ) : (
                "Create Account"
              )}
            </Button>

          </form>

          {/* Toggle Sign In <-> Sign Up */}
          {(view === "signIn" || view === "signUp") && (
            <div className="text-center text-sm mt-3">
              <span className="text-gray-500">
                {view === "signUp" ? "Already have an account? " : "New to Prompt Pro? "}
              </span>
              <button
                onClick={() => setView(view === "signUp" ? "signIn" : "signUp")}
                className="font-semibold text-violet-600 hover:text-violet-700"
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

