"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

type GamePhase = "welcome" | "loading" | "playing" | "result";

interface AudioUrls {
  ambient: string;
  music: string;
  language: string;
}

interface ResultData {
  score: number;
  distance: number;
  actualLocation: { lat: number; lng: number; city: string; country: string };
  guessedLocation: { lat: number; lng: number };
  stage: number;
  languagePhrase?: string;
  languageTranslation?: string;
  isNewHighScore?: boolean;
  isNewUser?: boolean;
  audio?: AudioUrls;
}

interface GameState {
  phase: GamePhase;
  username: string;
  isAuthenticated: boolean;
  sessionId: string | null;
  stage: number; // 1, 2, or 3
  audio: AudioUrls | null;
  guessCoords: { lat: number; lng: number } | null;
  result: ResultData | null;
  error: string | null;
  isLoading: boolean;
  isInitializing: boolean;
}

interface GameContextType extends GameState {
  startGame: (username: string) => Promise<void>;
  setGuessCoords: (lat: number, lng: number) => void;
  submitGuess: () => Promise<void>;
  nextStage: () => void;
  playAgain: () => void;
  logout: () => Promise<void>;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

const INITIAL_STATE: GameState = {
  phase: "welcome",
  username: "",
  isAuthenticated: false,
  sessionId: null,
  stage: 1,
  audio: null,
  guessCoords: null,
  result: null,
  error: null,
  isLoading: false,
  isInitializing: true,
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(INITIAL_STATE);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user?.username) {
            setState(s => ({ 
              ...s, 
              username: data.user.username, 
              isAuthenticated: true,
              isInitializing: false 
            }));
            return;
          }
        }
      } catch (err) {
        console.error("Auth check failed", err);
      }
      setState(s => ({ ...s, isInitializing: false }));
    }
    checkAuth();
  }, []);

  const startGame = useCallback(async (username: string) => {
    setState((s) => ({
      ...s,
      username,
      isAuthenticated: true,
      phase: "loading",
      isLoading: true,
      error: null,
    }));

    try {
      const res = await fetch("/api/game/generate", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate game");
      const data = await res.json();

      setState((s) => ({
        ...s,
        sessionId: data.sessionId,
        audio: data.audio,
        phase: "playing",
        stage: 1,
        isLoading: false,
        guessCoords: null,
        result: null,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Unknown error",
        phase: "welcome",
        isLoading: false,
      }));
    }
  }, []);

  const setGuessCoords = useCallback((lat: number, lng: number) => {
    setState((s) => ({ ...s, guessCoords: { lat, lng } }));
  }, []);

  const submitGuess = useCallback(async () => {
    if (!state.sessionId || !state.guessCoords) return;

    setState((s) => ({ ...s, isLoading: true }));

    try {
      const res = await fetch("/api/game/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: state.sessionId,
          username: state.username,
          guessedCoordinates: [state.guessCoords.lat, state.guessCoords.lng],
          stage: state.stage,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit guess");
      const result: ResultData = await res.json();

      setState((s) => ({
        ...s,
        result: { ...result, audio: s.audio ?? undefined },
        phase: "result",
        isLoading: false,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Unknown error",
        isLoading: false,
      }));
    }
  }, [state.sessionId, state.guessCoords, state.stage, state.audio, state.username]);

  const nextStage = useCallback(() => {
    setState((s) => ({
      ...s,
      stage: Math.min(s.stage + 1, 3) as 1 | 2 | 3,
    }));
  }, []);

  const playAgain = useCallback(() => {
    if (state.isAuthenticated && state.username) {
      startGame(state.username);
    } else {
      setState({ 
        ...INITIAL_STATE, 
        username: state.username, 
        isAuthenticated: state.isAuthenticated,
        isInitializing: false,
        phase: "welcome" 
      });
    }
  }, [state.username, state.isAuthenticated, startGame]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setState({ ...INITIAL_STATE, isInitializing: false });
  }, []);

  return (
    <GameContext.Provider
      value={{
        ...state,
        startGame,
        setGuessCoords,
        submitGuess,
        nextStage,
        playAgain,
        logout,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
