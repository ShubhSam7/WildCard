"use client";

import { TrendingUp, Wallet, Trophy, Clock, Users } from "lucide-react";

export default function LandingPage() {
  const liveMarkets = [
    {
      id: 1,
      category: "TECH",
      question: "Will a major AI model launch this quarter?",
      yesPercent: 65,
      noPercent: 35,
      volume: "45.2k tokens",
      endsIn: "18 hrs",
    },
    {
      id: 2,
      category: "SPORTS",
      question: "Will an underdog win a top-tier league this season?",
      yesPercent: 42,
      noPercent: 58,
      volume: "38.9k tokens",
      endsIn: "2 days",
    },
    {
      id: 3,
      category: "CRYPTO",
      question: "Will Bitcoin outperform Ethereum this month?",
      yesPercent: 78,
      noPercent: 22,
      volume: "62.1k tokens",
      endsIn: "5 hrs",
    },
    {
      id: 4,
      category: "ECONOMY",
      question: "Will inflation fall below forecasts this quarter?",
      yesPercent: 54,
      noPercent: 46,
      volume: "51.6k tokens",
      endsIn: "3 days",
    },
  ];

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1e1e1e]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <h1 className="text-2xl font-black tracking-tight">
              <span className="text-white">Wild</span>
              <span className="text-[#a6a5f2]">Card</span>
            </h1>

            {/* Nav Links - Centered */}
            <div className="hidden md:flex gap-8 text-sm font-medium absolute left-1/2 -translate-x-1/2">
              {["Leaderboard", "Markets", "Footer"].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="relative group py-1 transition-colors hover:text-[#a6a5f2]"
                >
                  {link}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#a6a5f2] group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <button onClick={() => { window.location.href = '/signin'; }}
              className="px-5 py-2 text-sm font-semibold hover:text-[#a6a5f2] transition-colors">
                Log In
              </button>
              <button onClick={() => { window.location.href = '/signup'; }}
              className="px-6 py-2.5 bg-[#a6a5f2] hover:bg-[#8f8edb] rounded-full text-sm font-bold text-white transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-1.5 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-full text-sm font-semibold text-[#8b5cf6]">
                🌍 Global Prediction Market
              </div>

              <h2 className="text-5xl md:text-7xl font-black leading-tight">
                Predict. Play. <span className="text-[#a6a5f2]">Prevail.</span>
              </h2>

              <p className="text-xl text-gray-400 leading-relaxed">
                The ultimate{" "}
                <span className="text-white font-bold">gamified</span>{" "}
                prediction market. Trade virtual tokens, follow odds, and climb
                the leaderboard.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 flex-wrap">
              {/* Primary Button - Flat Solid */}
              <button onClick={() => { window.location.href = '/dashboard'; }} className="px-10 py-4 bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl font-semibold text-base text-white transition-all">
                Start Predicting
              </button>

              {/* Secondary Button - Clean Outline */}
              <button className="px-8 py-3.5 bg-transparent border border-neutral-700 hover:bg-white hover:text-black rounded-lg font-medium text-base text-neutral-300 transition-all">
                How it Works
              </button>
            </div>

            {/* Stats Bar */}
            <div className="flex gap-8 pt-6 border-t border-white/10">
              {[
                { label: "Active Markets", value: "47" },
                { label: "Total Volume", value: "2.4M tokens" },
                { label: "Players", value: "1.2K+" },
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-2xl font-black text-[#a6a5f2]">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Trading Composition */}
          <div className="relative h-[500px] hidden md:block">
            {/* YES Card - Green */}
            <div className="absolute top-10 left-10 z-20">
              <div className="w-56 h-72 bg-[#272727] border-2 border-[#a9f99e]/30 rounded-2xl p-8 hover:border-[#a9f99e]/60 transition-all">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Prediction
                    </span>
                    <div className="w-10 h-10 bg-[#a9f99e]/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">YES</p>
                    <p className="text-6xl font-black text-[#a9f99e]">
                      80<span className="text-4xl">%</span>
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Will CSE win the Inter-Branch Tournament?
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* NO Card - Red */}
            <div className="absolute top-32 right-10 z-20">
              <div className="w-56 h-72 bg-[#272727] border-2 border-[#cc3131]/30 rounded-2xl p-8 hover:border-[#cc3131]/60 transition-all">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Prediction
                    </span>
                    <div className="w-10 h-10 bg-[#cc3131]/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">✗</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">NO</p>
                    <p className="text-6xl font-black text-[#cc3131]">
                      20<span className="text-4xl">%</span>
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Will CSE win the Inter-Branch Tournament?
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* VS Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
              <div className="w-16 h-16 bg-[#1e1e1e] border-2 border-[#a6a5f2] rounded-xl flex items-center justify-center font-black text-[#a6a5f2] text-lg">
                VS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Markets */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div>
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-bold text-white">Live Markets</h3>
              <a
                href="#all"
                className="text-[#8b5cf6] hover:text-[#7c3aed] text-sm font-medium transition-colors"
              >
                View All →
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {liveMarkets.map((market) => (
                <div
                  key={market.id}
                  className="rounded-2xl p-6 bg-[#272727] border border-white/5 hover:border-[#8b5cf6]/30 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-lg text-[10px] font-semibold text-[#8b5cf6] uppercase">
                      {market.category}
                    </span>
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {market.endsIn}
                    </div>
                  </div>

                  <h4 className="text-lg font-semibold mb-4 text-white leading-snug">
                    {market.question}
                  </h4>

                  {/* Probability Display */}
                  <div className="mb-4">
                    <div className="h-2 bg-red-500/20 rounded-full overflow-hidden mb-2 flex">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${market.yesPercent}%` }}
                      />
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${market.noPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 font-medium">
                      <span>Yes {market.yesPercent}%</span>
                      <span>No {market.noPercent}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{market.volume}</span>
                    </div>
                    <button className="px-4 py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg text-xs font-semibold transition-all">
                      Trade
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-[#a6a5f2]/5">
        <div className="max-w-6xl mx-auto">
          <div>
            <h3 className="text-4xl font-bold text-center mb-4 text-white">
              How It Works
            </h3>
            <p className="text-center text-gray-500 mb-16">
              Three simple steps to start winning
            </p>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  icon: Wallet,
                  title: "Get 10k Tokens",
                  description:
                    "Sign up with your email and receive 10,000 virtual tokens to start trading.",
                },
                {
                  icon: TrendingUp,
                  title: "Analyze Trends",
                  description:
                    "Study market probabilities, volume, and community sentiment to make informed predictions.",
                },
                {
                  icon: Trophy,
                  title: "Win & Climb",
                  description:
                    "Cash out winning positions and climb the leaderboard. Top predictors earn bragging rights!",
                },
              ].map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="text-center group">
                    <div
                      className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-colors"
                      style={{
                        backgroundColor:
                          index === 0
                            ? "#a6a5f220"
                            : index === 1
                              ? "#ff932e20"
                              : "#a9f99e20",
                        border:
                          index === 0
                            ? "2px solid #a6a5f240"
                            : index === 1
                              ? "2px solid #ff932e40"
                              : "2px solid #a9f99e40",
                      }}
                    >
                      <Icon
                        className="w-10 h-10"
                        style={{
                          color:
                            index === 0
                              ? "#a6a5f2"
                              : index === 1
                                ? "#ff932e"
                                : "#a9f99e",
                        }}
                      />
                    </div>
                    <h4 className="text-2xl font-bold mb-3">{step.title}</h4>
                    <p className="text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#a9f99e]/10">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2026 WildCard. A global prediction market for opinions.</p>
        </div>
      </footer>
    </div>
  );
}
