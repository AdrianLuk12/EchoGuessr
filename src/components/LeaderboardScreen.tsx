"use client";

import { useEffect, useState } from "react";
import { Trophy, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Entry {
  username: string;
  score: number;
  date: string;
}

interface PaginationMeta {
  page: number;
  per_page: number;
  total_pages: number;
  total_entries: number;
}

interface UserRank {
  user_id: string;
  username: string;
  score: number;
  rank: number | null;
  timestamp: string;
}

const MotionLink = motion.create(Link);

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const rowVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function LeaderboardScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [pageLoading, setPageLoading] = useState(false);
  
  // User rank state
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [userRankLoading, setUserRankLoading] = useState(false);

  // Fetch leaderboard with pagination
  const fetchLeaderboard = async (page: number = 1) => {
    setPageLoading(true);
    try {
      const url = `/api/leaderboard?page=${page}&per_page=10`;
      const response = await fetch(url);
      const data = await response.json();
      setEntries(data.data || []);
      setMeta(data.meta || null);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setPageLoading(false);
      setLoading(false);
    }
  };

  // Fetch user rank
  const fetchUserRank = async () => {
    setUserRankLoading(true);
    try {
      const response = await fetch("/api/leaderboard/rank");
      if (response.ok) {
        const data = await response.json();
        setUserRank(data);
      } else if (response.status === 401) {
        setUserRank(null);
      }
    } catch (error) {
      console.error("Failed to fetch user rank:", error);
    } finally {
      setUserRankLoading(false);
    }
  };

  useEffect(() => {
    // Fetch initial leaderboard
    fetchLeaderboard(1);

    // Fetch auth status and user rank
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          setIsLoggedIn(true);
          fetchUserRank();
        }
      })
      .catch(() => {});
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (!meta || newPage <= meta.total_pages)) {
      setCurrentPage(newPage);
      fetchLeaderboard(newPage);
    }
  };

  const renderUserRankSection = () => {
    if (!isLoggedIn) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-linear-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
        >
          <p className="text-center text-gray-300">
            Sign in to see your rank and score!
          </p>
        </motion.div>
      );
    }

    if (userRankLoading) {
      return (
        <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="h-16 bg-white/5 rounded animate-pulse" />
        </div>
      );
    }

    if (!userRank || userRank.rank === null) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-linear-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
        >
          <p className="text-center text-gray-300">
            No score recorded yet. Play the game to get on the leaderboard!
          </p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 rounded-lg bg-linear-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Your Rank</p>
            <p className="text-3xl font-bold text-amber-400">#{userRank.rank}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400 mb-1">Your Score</p>
            <p className="text-3xl font-bold text-amber-500">
              {userRank.score.toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen px-4 py-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="w-full max-w-lg">
        <motion.h1
          className="text-3xl font-bold flex items-center gap-2 mb-6"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Trophy className="text-amber-500" size={28} /> Leaderboard
        </motion.h1>

        {/* User Rank Section */}
        {renderUserRankSection()}

        {loading ? (
          <div className="space-y-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-[52px] bg-white/5 rounded-lg animate-pulse"
                style={{ animationDelay: `${i * 0.05}s` }}
              />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <p className="text-gray-400">No scores yet. Be the first!</p>
        ) : (
          <>
            <div className="space-y-1">
              {pageLoading ? (
                // Loading state for page transition - same height as entries
                Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[52px] bg-white/5 rounded-lg animate-pulse"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  />
                ))
              ) : (
                entries.map((entry, i) => {
                  const globalRank = (currentPage - 1) * (meta?.per_page || 10) + i + 1;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg min-h-[52px] ${
                        globalRank <= 3
                          ? "bg-amber-500/10 border border-amber-500/30"
                          : "bg-white/5"
                      }`}
                    >
                      <span
                        className={`w-8 text-center font-bold text-lg ${
                          globalRank === 1
                            ? "text-amber-400"
                            : globalRank === 2
                            ? "text-gray-300"
                            : globalRank === 3
                            ? "text-amber-700"
                            : "text-gray-500"
                        }`}
                      >
                        {globalRank}
                      </span>
                      <span className="flex-1 font-medium">{entry.username}</span>
                      <span className="text-amber-500 font-bold">
                        {entry.score.toLocaleString()}
                      </span>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            {meta && meta.total_pages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 flex items-center justify-between gap-2"
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition ${
                    currentPage <= 1
                      ? "bg-white/5 text-gray-600 cursor-not-allowed"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <ChevronLeft size={16} /> Prev
                </button>

                <span className="text-gray-400 text-sm">
                  Page {currentPage} of {meta.total_pages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= meta.total_pages}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition ${
                    currentPage >= meta.total_pages
                      ? "bg-white/5 text-gray-600 cursor-not-allowed"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  Next <ChevronRight size={16} />
                </button>
              </motion.div>
            )}
          </>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <MotionLink
            href="/"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg ${isLoggedIn ? "bg-white/10 hover:bg-white/20 border border-white/20 text-white" : "bg-amber-500 hover:bg-amber-400 text-black"} font-semibold transition`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Go back to home page
          </MotionLink>

          {isLoggedIn && (
            <MotionLink
              href="/?play=true"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold transition"
            >
              <RotateCcw size={16} /> Play Game
            </MotionLink>
          )}
        </div>
      </div>
    </motion.div>
  );
}
