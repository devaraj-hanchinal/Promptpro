"use client";

export default function CompanyLogos() {
  return (
    <div className="border-t border-gray-100 dark:border-gray-800 pt-10 mt-12 mb-8">
      <p className="text-sm font-medium text-gray-400 mb-6 uppercase tracking-wider text-center">
        Trusted by teams at innovative companies
      </p>
      <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale font-bold text-xl text-gray-600 select-none">
        <span>ZAPIER</span>
        <span>NOTION</span>
        <span>LINEAR</span>
        <span>RAYCAST</span>
        <span>VERCEL</span>
      </div>
    </div>
  );
}
