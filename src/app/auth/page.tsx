"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getAppwriteAccount, ID } from "@/lib/appwrite";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";

/* ─────────────────────────────────────────────── */
/* PASSWORD STRENGTH LOGIC */
/* ─────────────────────────────────────────────── */
const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["Very Weak", "Weak", "Medium", "Strong", "Very Strong"];
  const colors = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500", "bg-emerald-600"];

  return {
    score,
    label: labels[score - 1] || "",
    color: colors[score - 1] || "bg-gray-300",
  };
};

/* ─────────────────────────────────────────────── */
/* MAIN COMPONENT */
/* ─────────────────────────────────────────────── */
function AuthContent() {
  const [step, setStep] = useState<"signup" | "otp" | "password" | "signin">("signup");

  const [isLoading, setIsLoading] = useState(false);

  // Form values
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");

  // UI
  const [showPassword, setShowPassword] = useState(false);

  // OTP resend logic
  const [resendTimer, setResendTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(false);

  const { toast } = useToast();
  const searchParams = useSearchParams();
  const passwordStrength = getPasswordStrength(password);

  /* ─────────────────────────────────────────────── */
  /* TIMER EFFECT */
  /* ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!resendDisabled) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setResendDisabled(false);
          clearInterval(interval);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendDisabled]);

  /* ─────────────────────────────────────────────── */
  /* FORM SUBMIT HANDLER */
  /* ─────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const account = getAppwriteAccount();
    try {
      /* ───────── SIGNUP: send OTP ───────── */
      if (step === "signup") {
        try {
          await account.create(ID.unique(), email);
        } catch {
          toast({
            variant: "destructive",
            title: "Email Already Exists",
            description: "Try signing in instead.",
          });
          setStep("signin");
          setIsLoading(false);
          return;
        }

        localStorage.setItem("pp_name", fullName);
        localStorage.setItem("pp_email", email);

        await account.createEmailToken(ID.unique(), email);

        toast({ title: "Code Sent!", description: `Check your inbox.` });
        setStep("otp");
        setResendDisabled(true);
      }

      /* ───────── OTP VERIFY ───────── */
      else if (step === "otp") {
        const storedEmail = localStorage.getItem("pp_email");
        const storedName = localStorage.getItem("pp_name");

        if (!storedEmail) throw new Error("Signup expired. Start again.");

        await account.createEmailPasswordSession(storedEmail, otpCode);

        if (storedName) {
          await account.updateName(storedName);
          localStorage.removeItem("pp_name");
        }

        setEmail(storedEmail);
        toast({ title: "Verified!", description: "Now set a password." });
        setStep("password");
      }

      /* ───────── SET PASSWORD ───────── */
      else if (step === "password") {
        if (passwordStrength.score < 3)
          throw new Error("Password too weak. Add numbers, uppercase, symbols.");

        await account.updatePassword(password);
        await account.createEmailPasswordSession(email, password);

        toast({ title: "Account Ready!", description: "Welcome to Prompt Pro 🚀" });
        window.location.href = "/";
      }

      /* ───────── SIGN IN ───────── */
      else if (step === "signin") {
        await account.createEmailPasswordSession(email, password);
        toast({ title: "Welcome back!" });
        window.location.href = "/";
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  /* ─────────────────────────────────────────────── */
  /* RESEND OTP */
  /* ─────────────────────────────────────────────── */
  const handleResend = async () => {
    if (resendDisabled) return;

    const storedEmail = localStorage.getItem("pp_email");
    if (!storedEmail) return;

    const account = getAppwriteAccount();
    await account.createEmailToken(ID.unique(), storedEmail);

    toast({ title: "OTP Resent!", description: `Sent to ${storedEmail}` });
    setResendDisabled(true);
  };

  /* ─────────────────────────────────────────────── */
  /* UI SECTION */
  /* ─────────────────────────────────────────────── */
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <Link href="/" className="absolute left-6 top-6 flex items-center gap-2 text-gray-500">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="w-full max-w-md space-y-6">
        <h2 className="text-3xl font-semibold text-center">
          {step === "signup" && "Create an account"}
          {step === "otp" && "Verify Email"}
          {step === "password" && "Secure your account"}
          {step === "signin" && "Sign In"}
        </h2>

        <p className="text-center text-gray-500">
          {step === "signup" && "We'll send you a code to verify your email."}
          {step === "otp" && `Enter the code sent to ${email || localStorage.getItem("pp_email")}`}
          {step === "password" && "Set a strong password to complete signup."}
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* SIGNUP */}
          {step === "signup" && (
            <>
              <div>
                <Label>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </>
          )}

          {/* OTP */}
          {step === "otp" && (
            <div>
              <Label>Verification Code</Label>
              <Input value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required maxLength={6} />
            </div>
          )}

          {/* PASSWORD + STRENGTH BAR */}
          {step === "password" && (
            <div>
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

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-3 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded ${
                          i <= passwordStrength.score ? passwordStrength.color : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs font-medium ${
                      passwordStrength.score >= 4 ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SIGN IN PASSWORD */}
          {step === "signin" && (
            <>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </>
          )}

          <Button disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
            {step === "signup" && "Send Verification Code"}
            {step === "otp" && "Verify Code"}
            {step === "password" && "Finish & Login"}
            {step === "signin" && "Login"}
          </Button>
        </form>

        {/* RESEND OTP */}
        {step === "otp" && (
          <p className="text-center text-sm text-gray-500">
            Didn’t receive it?{" "}
            <button
              disabled={resendDisabled}
              onClick={handleResend}
              className={`underline ${resendDisabled ? "opacity-50" : "text-violet-600"}`}
            >
              Resend {resendDisabled && `in ${resendTimer}s`}
            </button>
          </p>
        )}

        {/* SWITCH SIGNIN ↔ SIGNUP */}
        {step !== "otp" && (
          <p className="text-center text-sm">
            {step === "signup" ? "Already have an account?" : "New to Prompt Pro?"}{" "}
            <button className="text-violet-600 underline"
              onClick={() => setStep(step === "signup" ? "signin" : "signup")}
            >
              {step === "signup" ? "Sign In" : "Create Account"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── */
export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <AuthContent />
    </Suspense>
  );
}



