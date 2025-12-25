"use client";

import { Suspense } from "react";
import VerifyPageContent from "./verifyContent";

export default function VerifyPage() {
  return (
    <Suspense fallback={<p className="text-center mt-10">Loading verification...</p>}>
      <VerifyPageContent />
    </Suspense>
  );
}

