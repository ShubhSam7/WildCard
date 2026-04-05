"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";

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
          <h2 className="text-xl font-bold mb-2">Create Account</h2>
          <p className="text-gray-400 text-sm mb-6">
            Sign up with your email to get started
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-medium mb-1 text-gray-300"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-2 text-sm bg-[#1e1e1e] border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  required
                />
              </div>
            </div>

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
                  placeholder="Create a strong password"
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
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login Buttons
          <div className="grid grid-cols-2 gap-3">
            <button className="py-2 px-3 bg-[#1e1e1e] border border-white/10 hover:border-white/20 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button className="py-2.5 px-4 bg-[#1e1e1e] border border-white/10 hover:border-white/20 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div> */}

          {/* Login Link */}
          <p className="text-center text-xs text-gray-400 mt-3">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-[#8b5cf6] hover:text-[#7c3aed] font-medium transition-colors"
            >
              Log In
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
