"use client";

import { useState } from "react";
import PasswordField from "@/components/ui/PasswordField";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return alert("Password too weak");

    // TODO: Appwrite signup logic here
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-semibold mb-6">Create your account</h1>

      <form onSubmit={handleSignup} className="space-y-5">
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-md px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <PasswordField value={password} onChange={setPassword} />

        <button className="w-full bg-purple-600 text-white py-2 rounded-md">
          Create Account
        </button>
      </form>
    </div>
  );
}
