"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
    console.log("Signup:", formData);
  };

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

        {/* Signup Card */}
        <div className="bg-[#272727] border border-white/5 rounded-2xl p-7 backdrop-blur-xl">
          <h2 className="text-xl font-bold mb-2">Sign In</h2>
          <p className="text-gray-400 text-sm mb-6">
            Sign in with your email
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium mb-1 text-gray-300"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-2 text-sm bg-[#1e1e1e] border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium mb-1 text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-9 pr-10 py-2 text-sm bg-[#1e1e1e] border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                className="mt-0.5 w-3.5 h-3.5 accent-[#8b5cf6] cursor-pointer"
                required
              />
              <label
                htmlFor="terms"
                className="text-[10px] text-gray-400 leading-tight"
              >
                I agree to the{" "}
                <a href="#" className="text-[#8b5cf6] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#8b5cf6] hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-lg text-sm font-semibold text-white transition-all"
            >
              Create Account
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-2 bg-[#272727] text-gray-500">
                Signin
              </span>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-xs text-gray-400 mt-3">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[#8b5cf6] hover:text-[#7c3aed] font-medium transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Welcome Bonus Badge */}
        <div className="mt-3 text-center">
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
