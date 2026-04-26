"use client";

import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="h-screen bg-[#1e1e1e] text-white flex items-center justify-center px-6 py-8 overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#a6a5f2]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-6">
          <Link href="/">
            <h1 className="text-2xl font-black tracking-tight mb-2 cursor-pointer hover:opacity-80 transition-opacity">
              <span className="text-white">Wild</span>
              <span className="text-[#a6a5f2]">Card</span>
            </h1>
          </Link>
          <p className="text-gray-400 text-sm">
            Join the ultimate prediction platform
          </p>
        </div>

        {/* Clerk SignUp Component */}
        <div className="flex justify-center">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-[#272727] border border-white/5 shadow-none",
                headerTitle: "text-white",
                headerSubtitle: "text-gray-400",
                socialButtonsBlockButton:
                  "bg-[#1e1e1e] border border-white/10 hover:border-white/20 text-white",
                socialButtonsBlockButtonText: "text-white font-medium",
                formButtonPrimary:
                  "bg-[#8b5cf6] hover:bg-[#7c3aed] text-white normal-case",
                formFieldInput:
                  "bg-[#1e1e1e] border border-white/10 text-white focus:border-[#8b5cf6]",
                formFieldLabel: "text-gray-300",
                footerActionLink: "text-[#8b5cf6] hover:text-[#7c3aed]",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-[#8b5cf6]",
                formFieldInputShowPasswordButton: "text-gray-400",
                otpCodeFieldInput:
                  "bg-[#1e1e1e] border border-white/10 text-white",
                formResendCodeLink: "text-[#8b5cf6]",
                dividerLine: "bg-white/10",
                dividerText: "text-gray-500",
              },
            }}
          />
        </div>

        {/* Welcome Bonus Badge */}
        <div className="mt-6 text-center">
          <div className="inline-block px-3 py-1.5 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-full">
            <span className="text-xs font-semibold text-[#8b5cf6]">
              🎁 Get 10,000 tokens on signup!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
