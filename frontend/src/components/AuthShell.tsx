import type { ReactNode } from "react";
import { Logo } from "./Logo";

type Props = {
  title: string;
  children: ReactNode;
  variant?: "leaves" | "park";
};

export function AuthShell({ title, children, variant = "leaves" }: Props) {
  return (
    <main className={`auth-bg ${variant === "park" ? "auth-bg-park" : ""}`}>
      <section className="auth-card">
        <div className="mb-7 flex justify-center">
          <Logo />
        </div>
        <h1 className="mb-7 text-center text-3xl font-extrabold text-ink">{title}</h1>
        {children}
      </section>
    </main>
  );
}
