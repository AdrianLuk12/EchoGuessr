"use strict";
"use client";

import { useState, useEffect } from "react";
import { Headphones, ArrowRight, Volume2, Music, MessageCircle, Trophy, Loader2, ArrowLeft, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useGame } from "@/context/GameContext";

interface WelcomeScreenProps {
  onStart: (username: string) => void;
}

const MotionLink = motion.create(Link);

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stages = [
  { icon: Volume2, label: "Stage 1 — Ambient sounds", multiplier: "3.0×" },
  { icon: Music, label: "Stage 2 — Regional music", multiplier: "1.8×" },
  { icon: MessageCircle, label: "Stage 3 — Spoken language", multiplier: "1.0×" },
];

type AuthStep = "username" | "login" | "register";

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const { username: globalUsername, isAuthenticated, isInitializing, logout } = useGame();
  
  const [step, setStep] = useState<AuthStep>("username");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (globalUsername && isAuthenticated) {
      setUsername(globalUsername);
      
      // Auto-start game if ?play=true is in URL
      if (typeof window !== "undefined" && window.location.search.includes("play=true")) {
        // Remove the query param without reloading the page
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
        onStart(globalUsername);
      }
    }
  }, [globalUsername, isAuthenticated, onStart]);

  const validateUsername = (name: string): string => {
    if (!name) return "";
    if (/\s/.test(name)) return "Username cannot contain spaces.";
    if (!/^[a-zA-Z0-9._+-]+$/.test(name)) return "Only letters, digits, and ., _, -, + are allowed.";
    if (name.startsWith('.') || name.endsWith('.')) return "Username cannot start or end with a period.";
    if (/\.\./.test(name)) return "Username cannot contain consecutive periods.";
    return "";
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUsername(val);
    const validationError = validateUsername(val);
    if (validationError) {
      setError(validationError);
    } else {
      setError("");
    }
  };

  const handleCheckUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    const validationError = validateUsername(username.trim());
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to check username");
      } else {
        setStep(data.exists ? "login" : "register");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    if (step === "register" && password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      const endpoint = step === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed");
      } else {
        onStart(username.trim());
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setStep("username");
    setPassword("");
    setError("");
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-amber-500">
        <Loader2 size={48} className="animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen px-4 text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.12 }}
    >
      <motion.div className="mb-6 flex items-center gap-3" variants={itemVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
        <Headphones size={48} className="text-amber-500" />
        <h1 className="text-5xl font-extrabold tracking-tight">
          Echo<span className="text-amber-500">Guessr</span>
        </h1>
      </motion.div>

      <motion.p className="text-gray-400 max-w-md mb-8 leading-relaxed" variants={itemVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
        A mystery location is hidden behind <strong className="text-white">three audio clues</strong>: ambient sounds, regional music, and a spoken phrase. Listen closely, place your pin on the map, and see how close you get. The fewer clues you need, the higher you score.
      </motion.p>

      <motion.div
        className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-sm"
        variants={itemVariants}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {(!isAuthenticated && step === "username") && (
          <>
            <h2 className="text-lg font-semibold mb-3">How It Works</h2>
            <ol className="text-sm text-gray-400 text-left space-y-2 mb-6">
              {stages.map(({ icon: Icon, label, multiplier }, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-gray-500 font-medium w-4 shrink-0">{i + 1}.</span>
                  <Icon size={14} className="text-amber-500 shrink-0" />
                  <span>{label}</span>
                  <span className="ml-auto text-amber-500 font-medium">{multiplier}</span>
                </li>
              ))}
            </ol>
          </>
        )}

        {!isAuthenticated && step !== "username" && (
          <div className="flex items-center mb-6">
            <button onClick={goBack} className="p-2 -ml-2 text-gray-400 hover:text-white transition rounded-full hover:bg-white/10">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold ml-2">
              {step === "login" ? "Welcome back" : "Create Account"}
            </h2>
          </div>
        )}

        {isAuthenticated ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-white">Welcome, {username}!</h2>
              <button 
                onClick={logout} 
                className="p-2 text-gray-400 hover:text-red-400 transition rounded-full hover:bg-white/10"
                title="Log out"
              >
                <LogOut size={18} />
              </button>
            </div>
            
            <motion.button
              onClick={() => onStart(username)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 px-4 py-3 w-full rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold transition text-lg"
            >
              Start Game <ArrowRight size={20} />
            </motion.button>
            
            <MotionLink
              href="/leaderboard"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition"
            >
              <Trophy size={18} /> View Leaderboard
            </MotionLink>
          </div>
        ) : (
          <form onSubmit={step === "username" ? handleCheckUsername : handleAuth} className="flex flex-col gap-3">
            {step === "username" ? (
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={handleUsernameChange}
                maxLength={20}
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                disabled={isLoading}
              />
            ) : (
              <div className="flex flex-col gap-3 text-left">
                <p className="text-sm text-gray-400">
                  {step === "login" 
                    ? `Enter password for ${username}` 
                    : `Create a password for ${username}`}
                </p>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                  disabled={isLoading}
                />
                {step === "register" && (
                  <p className="text-xs text-gray-500">Minimum 8 characters</p>
                )}
              </div>
            )}

            {error && (
              <div className="text-red-400 text-sm mt-1">{error}</div>
            )}

            <motion.button
              type="submit"
              disabled={isLoading || (step === "username" ? !username.trim() : !password)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 mt-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold transition"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : (
                <>
                  {step === "username" ? "Next" : (step === "login" ? "Login" : "Register")} <ArrowRight size={16} />
                </>
              )}
            </motion.button>

            {step === "username" && (
              <MotionLink
                href="/leaderboard"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition mt-1"
              >
                <Trophy size={16} /> View Leaderboard
              </MotionLink>
            )}
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}