import { Eye, Lock, Mail } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, error, clearError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => clearError, [clearError]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await signIn(username, password);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Вход в систему" variant="park">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="input-wrap"><Mail size={18} /><input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Email или логин" required /></label>
        <label className="input-wrap"><Lock size={18} /><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Пароль" required /><Eye size={17} /></label>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink/65"><input type="checkbox" className="h-4 w-4" /> Запомнить меня</label>
          <a className="font-bold text-leaf-700" href="#">Забыли пароль?</a>
        </div>
        {error && <p className="text-sm font-bold text-red-600">{error}</p>}
        <button className="btn btn-primary h-12 w-full" disabled={submitting} type="submit">
          {submitting ? "Входим..." : "Войти"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink/65">Нет аккаунта? <Link className="font-bold text-leaf-700" to="/register">Зарегистрироваться</Link></p>
    </AuthShell>
  );
}
