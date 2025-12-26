"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const [step, setStep] = useState<"signin"|"signup"|"checkEmail"|"otp"|"password">("signin");
  const [email, setEmail] = useState("");
  const [emailExists, setEmailExists] = useState<boolean|null>(null);

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // -------------------------
  // PASSWORD STRENGTH LOGIC
  // -------------------------
  const hasMin   = password.length >= 8;
  const hasNum   = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const strength = [hasMin, hasNum, hasUpper].filter(Boolean).length;

  // -------------------------
  // EMAIL CHECK MOCK — replace w/ Appwrite later
  // -------------------------
  const fakeUserDB = ["test@gmail.com","demo@user.com"];
  const checkEmail = async () => {
    const exists = fakeUserDB.includes(email);
    setEmailExists(exists);
    if (exists) setStep("checkEmail"); // show password box
    else setStep("signup"); // go to sign up page w/ email prefilled
  };

  const verifyOtp = () => {
    if (otp.length === 6) setStep("password");
  };

  const createPassword = () => {
    if (strength >= 2) window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* -------- LEFT HERO PANEL -------- */}
      <aside className="hidden lg:flex flex-col justify-between w-1/2 px-12 py-16 bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
        <div className="text-4xl font-semibold leading-tight">
          Master AI prompting<br/>
          without guesswork
        </div>

        <div className="space-y-6 text-sm opacity-95">
          <div>
            <div className="text-lg font-bold">✨ Instant Prompt Optimization</div>
            <div>Transform raw prompts into top-tier results.</div>
          </div>
          <div>
            <div className="text-lg font-bold">🚀 10x Productivity</div>
            <div>Save hours writing content, emails, scripts & more.</div>
          </div>
          <div>
            <div className="text-lg font-bold">👥 Trusted by 10,000+ creators</div>
            <div>Professionals scaling their output daily.</div>
          </div>
        </div>

        <p className="text-sm opacity-75">© Prompt Pro — Built for creators.</p>
      </aside>


      {/* -------- RIGHT AUTH PANEL -------- */}
      <main className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8">
        
        {/* LOGO */}
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Prompt Pro</h1>

        {/* ---------------- SIGN IN ---------------- */}
        {step === "signin" && (
          <div className="w-full max-w-sm space-y-6">
            <h2 className="text-2xl font-semibold">Welcome back 👋</h2>
            <p className="text-gray-500">Enter your email to continue</p>

            <Input type="email" placeholder="name@example.com"
              value={email} onChange={e=>setEmail(e.target.value)} />

            <Button className="w-full bg-violet-600 hover:bg-violet-700"
              onClick={checkEmail}>
              Continue <ArrowRight className="ml-2 w-4 h-4"/>
            </Button>

            <p className="text-sm text-center text-gray-600">
              New here?{" "}
              <button className="text-violet-600 font-medium"
                onClick={()=>setStep("signup")}>
                Create account
              </button>
            </p>
          </div>
        )}

        {/* ---------------- EXISTING EMAIL → PASSWORD ---------------- */}
        {step === "checkEmail" && (
          <div className="w-full max-w-sm space-y-6">
            <h2 className="text-2xl font-semibold">Login</h2>
            <p className="text-gray-500">{email}</p>

            <div className="relative">
              <Input type={showPass?"text":"password"} placeholder="Password"
                value={password} onChange={e=>setPassword(e.target.value)} />
              <button className="absolute right-3 top-2.5 text-gray-500"
                onClick={()=>setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>

            <Button className="w-full bg-violet-600 hover:bg-violet-700"
              onClick={()=>window.location.href="/"}>
              Sign In
            </Button>
          </div>
        )}

        {/* ---------------- SIGN UP EMAIl PREFILLED ---------------- */}
        {step === "signup" && (
          <div className="w-full max-w-sm space-y-6">
            <h2 className="text-2xl font-semibold">Create your account</h2>
            <p className="text-gray-500">We'll verify your email first</p>

            <Input value={email} readOnly className="bg-gray-200"/>

            <Button className="w-full bg-violet-600 hover:bg-violet-700"
              onClick={()=>setStep("otp")}>
              Send OTP
            </Button>
          </div>
        )}

        {/* ---------------- OTP VERIFICATION ---------------- */}
        {step === "otp" && (
          <div className="w-full max-w-sm space-y-6">
            <h2 className="text-2xl font-semibold">Verify your email</h2>
            <p className="text-gray-500">Enter the 6-digit code sent to {email}</p>

            <Input maxLength={6} value={otp} onChange={e=>setOtp(e.target.value)}
              placeholder="123456" className="text-center"/>

            <Button className="w-full bg-violet-600 hover:bg-violet-700"
              disabled={otp.length !== 6}
              onClick={verifyOtp}>
              Verify OTP
            </Button>
          </div>
        )}

        {/* ---------------- PASSWORD SETUP ---------------- */}
        {step === "password" && (
          <div className="w-full max-w-sm space-y-6">
            <h2 className="text-2xl font-semibold">Create password</h2>

            <div className="relative">
              <Input type={showPass?"text":"password"} placeholder="Password"
                value={password} onChange={e=>setPassword(e.target.value)} />
              <button className="absolute right-3 top-2.5 text-gray-500"
                onClick={()=>setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>

            {/* Password Strength */}
            <div className="space-y-1">
              <div className="h-2 rounded bg-gray-200 overflow-hidden">
                <div className={`h-full transition-all ${
                  strength===1 ? "w-1/3 bg-red-500" :
                  strength===2 ? "w-2/3 bg-yellow-500" :
                  strength===3 ? "w-full bg-green-600" : ""
                }`} />
              </div>
              <div className="text-xs text-gray-600">
                Password must have:
                <div className="flex gap-2 mt-1">
                  <span className={hasMin?"text-green-600":"text-gray-400"}>8+ chars</span>
                  <span className={hasNum?"text-green-600":"text-gray-400"}>number</span>
                  <span className={hasUpper?"text-green-600":"text-gray-400"}>uppercase</span>
                </div>
              </div>
            </div>

            <Button className="w-full bg-violet-600 hover:bg-violet-700"
              disabled={strength < 2}
              onClick={createPassword}>
              Create Account
            </Button>
          </div>
        )}

      </main>
    </div>
  );
}





