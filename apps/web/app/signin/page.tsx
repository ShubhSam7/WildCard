"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8080/auth/signin", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to sign in");
      }

      // Store token if provided
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Redirect to dashboard or home
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
              <span className="text-white">IIITN</span>
              <span className="text-[#a6a5f2]">Predict</span>
            </h1>
          </Link>
          <p className="text-gray-400 text-sm">Welcome back to the platform</p>
        </div>

        {/* Signin Card */}
        <div className="bg-[#272727] border border-white/5 rounded-2xl p-7 backdrop-blur-xl">
          <h2 className="text-xl font-bold mb-2">Sign In</h2>
          <p className="text-gray-400 text-sm mb-6">
            Enter your credentials to continue
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

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
                  placeholder="your.name@iiitn.ac.in"
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

            {/* Forgot Password Link */}
            <div className="text-right">
              <a
                href="#"
                className="text-xs text-[#8b5cf6] hover:text-[#7c3aed] transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:bg-[#8b5cf6]/50 disabled:cursor-not-allowed rounded-lg text-sm font-semibold text-white transition-all"
            >
              {isLoading ? "Signing In..." : "Sign In"}
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

          {/* Sign Up Link */}
          <p className="text-center text-xs text-gray-400 mt-3">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-[#8b5cf6] hover:text-[#7c3aed] font-medium transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Welcome Back Badge */}
        <div className="mt-3 text-center">
          <div className="inline-block px-3 py-1.5 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-full">
            <span className="text-xs font-semibold text-[#8b5cf6]">
              👋 Welcome back, Predictor!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
