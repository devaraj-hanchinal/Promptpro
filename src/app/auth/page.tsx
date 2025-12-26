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

/* ----------------------------------------------
   PASSWORD STRENGTH LOGIC
---------------------------------------------- */
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

/* ----------------------------------------------
   MAIN AUTH CONTENT
---------------------------------------------- */
function AuthContent() {
  const [step, setStep] = useState<"signup" | "otp" | "password" | "signin">("signup");

  const [isLoading, setIsLoading] = useState(false);

  // form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // OTP timer
  const [resendTimer, setResendTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(false);

  const { toast } = useToast();
  const passwordStrength = getPasswordStrength(password);
  const searchParams = useSearchParams();

  /* ----------------------------------------------
     TIMER EFFECT
---------------------------------------------- */
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

  /* ----------------------------------------------
     SUBMIT HANDLER
---------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const account = getAppwriteAccount();
    try {
      /* -------- SIGNUP -------- */
      if (step === "signup") {
        const internalPass = ID.unique(); // internal password, never shown to user

        try {
          await account.create(ID.unique(), email, internalPass, fullName);
        } catch {
          toast({
            variant: "destructive",
            title: "Email already exists",
            description: "Try signing in instead.",
          });
          setStep("signin");
          setIsLoading(false);
          return;
        }

        localStorage.setItem("pp_name", fullName);
        localStorage.setItem("pp_email", email);

        await account.createEmailToken(ID.unique(), email);

        toast({ title: "Verification Sent!", description: "Enter the OTP sent to your email." });
        setResendDisabled(true);
        setStep("otp");
      }

      /* -------- OTP VERIFY -------- */
      else if (step === "otp") {
        const storedEmail = localStorage.getItem("pp_email");
        if (!storedEmail) throw new Error("Signup expired. Start again.");

        await account.createEmailPasswordSession(storedEmail, otpCode);

        toast({ title: "Email Verified!", description: "Now create a password." });
        setEmail(storedEmail);
        setStep("password");
      }

      /* -------- SET PASSWORD -------- */
      else if (step === "password") {
        if (passwordStrength.score < 3)
          throw new Error("Password too weak. Add numbers, uppercase, symbols.");

        await account.updatePassword(password);
        await account.createEmailPasswordSession(email, password);

        toast({ title: "Account Ready!", description: "Welcome to Prompt Pro!" });
        window.location.href = "/";
      }

      /* -------- SIGN IN -------- */
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

  /* ----------------------------------------------
     RESEND OTP
---------------------------------------------- */
  const handleResend = async () => {
    if (resendDisabled) return;

    const storedEmail = localStorage.getItem("pp_email");
    if (!storedEmail) return;

    const account = getAppwriteAccount();
    await account.createEmailToken(ID.unique(), storedEmail);

    toast({ title: "OTP Resent!", description: `Sent to ${storedEmail}` });
    setResendDisabled(true);
  };

  /* ----------------------------------------------
     UI
---------------------------------------------- */
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <Link href="/" className="absolute left-6 top-6 flex items-center gap-2 text-gray-500">
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>

      <div className="w-full max-w-md space-y-6">
        <h2 className="text-3xl font-semibold text-center">
          {step === "signup" && "Create an account"}
          {step === "otp" && "Verify your email"}
          {step === "password" && "Create password"}
          {step === "signin" && "Sign In"}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>

          {/* SIGNUP FIELDS */}
          {step === "signup" && (
            <>
              <Label>Full Name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />

              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </>
          )}

          {/* OTP FIELD */}
          {step === "otp" && (
            <>
              <Label>Enter OTP</Label>
              <Input value={otpCode} onChange={(e) => setOtpCode(e.target.value)} maxLength={6} required />
            </>
          )}

          {/* PASSWORD FIELD + STRENGTH */}
          {step === "password" && (
            <>
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

              {password.length > 0 && (
                <div className="mt-3 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded ${
                          i <= passwordStrength.score ? passwordStrength.color : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-gray-500">{passwordStrength.label}</p>
                </div>
              )}
            </>
          )}

          {/* SIGNIN FIELDS */}
          {step === "signin" && (
            <>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </>
          )}

          <Button disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="animate-spin mr-2" />}
            {step === "signup" && "Send OTP"}
            {step === "otp" && "Verify OTP"}
            {step === "password" && "Finish & Login"}
            {step === "signin" && "Login"}
          </Button>
        </form>

        {/* RESEND OTP */}
        {step === "otp" && (
          <p className="text-center text-sm">
            Didn’t get code?
            <button
              disabled={resendDisabled}
              onClick={handleResend}
              className={`ml-1 underline ${
                resendDisabled ? "opacity-50" : "text-violet-600"
              }`}
            >
              Resend {resendDisabled && `${resendTimer}s`}
            </button>
          </p>
        )}

        {/* SWITCH */}
        {step !== "otp" && (
          <p className="text-center text-sm">
            {step === "signup" ? "Already have an account?" : "New here?"}{" "}
            <button
              className="text-violet-600 underline"
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

/* ---------------------------------------------- */
export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <AuthContent />
    </Suspense>
  );
}



