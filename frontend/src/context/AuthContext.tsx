import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getErrorMessage, getProfile, login, logout, register, type UserProfile } from "../api/api";

type RegisterPayload = Parameters<typeof register>[0];

type AuthContextValue = {
  user: UserProfile | null;
  loading: boolean;
  error: string;
  isModerator: boolean;
  refresh: () => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const profile = await getProfile();
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    setError("");
    try {
      const profile = await login(username, password);
      setUser(profile);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const signUp = useCallback(async (payload: RegisterPayload) => {
    setError("");
    try {
      const profile = await register(payload);
      setUser(profile);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError("");
    await logout().catch(() => undefined);
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(""), []);

  const value = useMemo<AuthContextValue>(() => {
    const role = user?.profile?.role?.name;
    return {
      user,
      loading,
      error,
      isModerator: Boolean(user && (role === "moderator" || role === "admin")),
      refresh,
      signIn,
      signUp,
      signOut,
      clearError,
    };
  }, [user, loading, error, refresh, signIn, signUp, signOut, clearError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
