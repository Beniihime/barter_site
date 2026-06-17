import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function FullPageState({ text }: { text: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#fffdf9] px-6 text-center">
      <div className="rounded-2xl bg-white px-8 py-6 shadow-card">
        <p className="text-sm font-bold text-ink/65">{text}</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageState text="Проверяем сессию..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function ModeratorRoute({ children }: { children: ReactNode }) {
  const { user, loading, isModerator } = useAuth();

  if (loading) {
    return <FullPageState text="Проверяем права доступа..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isModerator) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullPageState text="Загружаем..." />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
