"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getAppwriteAccount, ID } from "@/lib/appwrite";
import { Loader2, Mail, Lock, User } from "lucide-react";

function AuthContent() {
  const router = useRouter();
  const { toast } = useToast();

  /* ---------------------- UI STEPS ---------------------- */
  const [step, setStep] = useState<"email" | "otp" | "password">("email");

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [uid, setUid] = useState("");

  const [name, setName] = useState("");
  const [userExists, setUserExists] = useState<boolean | null>(null);

  const [password, setPassword] = useState("");
  const [progress, setProgress] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  /* ---------------- Password Strength Progress ---------------- */
  useEffect(() => {
    let p = 0;
    if (password.length >= 8) p += 25;
    if (/[A-Z]/.test(password)) p += 25;
    if (/[0-9]/.test(password)) p += 25;
    if (/[^A-Za-z0-9]/.test(password)) p += 25;
    setProgress(p);
  }, [password]);

  /* --------------------- STEP 1: CHECK EMAIL ---------------------- */
  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;

    setIsLoading(true);
    const account = getAppwriteAccount();
    try {
      await account.get();
      // if logged in already
      router.push("/");
    } catch {}

    try {
      await account.createEmailPasswordSession(email, "invalid");
    } catch {
      try {
        const existsTest = await account.createEmailPasswordSession(email, "invalid2");
        console.log(existsTest);
      } catch (err: any) {
        if (err?.code === 401) setUserExists(true);
        else setUserExists(false);
      }
    }

    setIsLoading(false);

    if (userExists === null) return;

    if (userExists) {
      // SIGN IN → ask for password
      setStep("password");
    } else {
      // SIGN UP → ask for name then send OTP
      setStep("otp");
      try {
        const account = getAppwriteAccount();
        await account.create(ID.unique(), email, "TempPass@123", name || "User");
        const tok = await account.createEmailToken(email);
        setUid(tok.userId);
        toast({ title: "OTP Sent!", description: "Check your email inbox." });
      } catch {
        toast({ variant: "destructive", title: "Error creating account" });
      }
    }
  };

  /* --------------------- STEP 2: VERIFY OTP ---------------------- */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;

    setIsLoading(true);
    try {
      const account = getAppwriteAccount();
      await account.createSession(uid, otpCode); // <- correct OTP verification
      setStep("password");
    } catch {
      toast({ variant: "destructive", title: "Invalid OTP" });
    }
    setIsLoading(false);
  };

  /* --------------------- STEP 3: SET PASSWORD ---------------------- */
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (progress < 50) return toast({ title: "Weak Password", description: "Add more complexity." });

    setIsLoading(true);
    try {
      const account = getAppwriteAccount();
      await account.updatePassword(password);
      await account.createEmailPasswordSession(email, password);
      router.push("/");
    } catch (err) {
      toast({ variant: "destructive", title: "Error creating password" });
    }
    setIsLoading(false);
  };

  /* --------------------------------------------------
                      UI
  ---------------------------------------------------*/
  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900">

      {/* -- LEFT SPLIT / HERO -- */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-[#0F172A] text-white p-12 relative">
        <div>
          <h1 className="text-5xl font-bold leading-snug">
            Level up your
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Prompting Skills.
            </span>
          </h1>
          <p className="mt-4 text-gray-300 max-w-md">
            Unlock advanced AI content creation workflows, boost productivity, and automate your creativity.
          </p>
        </div>

        <div className="text-sm text-gray-400 space-y-1">
          <p>✓ Trusted by thousands</p>
          <p>✓ Premium prompt library</p>
          <p>✓ Real results within weeks</p>
        </div>
      </div>

      {/* -- RIGHT SPLIT / FORM -- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-10">
        <div className="w-full max-w-md space-y-8">

          {/* --------------------- EMAIL STEP --------------------- */}
          {step === "email" && (
            <form onSubmit={handleEmailCheck} className="space-y-4">
              <div className="space-y-2">
                <Label>Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    className="pl-10 h-11"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <Button className="w-full h-11" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Continue"}
              </Button>
            </form>
          )}

          {/* --------------------- OTP STEP --------------------- */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">

              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    className="pl-10 h-11"
                    placeholder="Your name"
                    value={name}
                    required
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Enter OTP sent to {email}</Label>
                <div className="relative">
                  <Input
                    className="h-11"
                    value={otpCode}
                    placeholder="123456"
                    required
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                </div>
              </div>

              <Button className="w-full h-11" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Verify OTP"}
              </Button>

            </form>
          )}

          {/* --------------------- PASSWORD STEP --------------------- */}
          {step === "password" && (
            <form onSubmit={handleSetPassword} className="space-y-5">
              <div className="space-y-2">
                <Label>Create password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    className="pl-10 h-11"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Strength bar */}
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                    background:
                      progress < 50 ? "red" : progress < 75 ? "orange" : "green",
                  }}
                />
              </div>

              <Button className="w-full h-11" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Finish & Log In"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin" /></div>}>
      <AuthContent />
    </Suspense>
  );
}






