"use client";

import { useState } from "react";
import { account } from "@/lib/appwrite"; // your Appwrite client
import { ID } from "appwrite";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 1️⃣ Create user account
      await account.create(ID.unique(), email, password, name);

      // 2️⃣ Send verification link
      await account.createVerification(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify`
      );

      setMessage("Verification link sent! Check your email to verify.");
    } catch (error: any) {
      console.log(error);
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="w-full max-w-md mx-auto space-y-6">
      <h2 className="text-3xl font-semibold">Create free account</h2>

      <input
        type="text"
        placeholder="Full Name"
        className="input"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        className="input"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="input"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={loading}
      >
        {loading ? "Sending verification..." : "Create Account"}
      </button>

      {message && (
        <p className="text-sm text-center text-green-600">{message}</p>
      )}
    </form>
  );
}

