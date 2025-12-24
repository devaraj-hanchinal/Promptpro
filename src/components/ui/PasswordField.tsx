"use client";

import { useState, useMemo } from "react";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

interface PasswordFieldProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function PasswordField({
  value,
  onChange,
  placeholder = "Password",
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  const strength = useMemo(() => {
    if (!value) return "none";
    const len = value.length >= 8;
    const num = /\d/.test(value);
    const char = /[a-zA-Z]/.test(value);

    if (len && num && char) return "strong";
    if (len) return "medium";
    return "weak";
  }, [value]);

  const strengthDetails: Record<
    string,
    { color: string; text: string; icon: JSX.Element } | null
  > = {
    strong: {
      color: "bg-green-500",
      text: "Strong password",
      icon: <CheckCircle className="w-4 h-4 text-green-600" />,
    },
    medium: {
      color: "bg-yellow-400",
      text: "Add letters & numbers",
      icon: <AlertCircle className="w-4 h-4 text-yellow-500" />,
    },
    weak: {
      color: "bg-red-500",
      text: "At least 8 characters required",
      icon: <AlertCircle className="w-4 h-4 text-red-600" />,
    },
    none: null,
  };

  const status = strengthDetails[strength];

  return (
    <div className="space-y-1">
      {/* Password Input */}
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border px-3 py-2 pr-10 focus:ring-2 focus:ring-purple-500 outline-none"
        />

        {/* Eye Icon */}
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* Strength Indicator */}
      {status && (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className={`h-2.5 w-2.5 rounded-full ${status.color}`} />
          {status.icon}
          {status.text}
        </div>
      )}
    </div>
  );
}
