"use client";

import { useSearchParams } from "next/navigation";
import { account } from "@/lib/appwrite";
import { useState, useEffect } from "react";

export default function VerifyPageContent() {
  const params = useSearchParams();
  const userId = params.get("userId");
  const secret = params.get("secret");

  const [status, setStatus] = useState("Verifying your email...");

  useEffect(() => {
    async function verifyEmail() {
      if (!userId || !secret) {
        setStatus("Invalid verification link.");
        return;
      }

      try {
        await account.updateVerification(userId, secret);
        setStatus("🎉 Email verified successfully! You can now log in.");
      } catch (err: any) {
        console.log(err);
        setStatus("❌ Verification failed or expired.");
      }
    }

    verifyEmail();
  }, [userId, secret]);

  return (
    <main className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-6 border rounded-lg shadow">
        <h1 className="text-xl font-semibold mb-3">Email Verification</h1>
        <p>{status}</p>
      </div>
    </main>
  );
}
