"use client";

import { account } from "@/lib/appwrite";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Verifying your email...");

  useEffect(() => {
    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");

    if (userId && secret) {
      account.updateVerification(userId, secret)
        .then(() => setStatus("Email verified! Redirecting to login..."))
        .then(() => setTimeout(() => router.push("/auth/login"), 2000))
        .catch(() => setStatus("Invalid or expired link."));
    }
  }, []);

  return <p className="text-center mt-20">{status}</p>;
}

