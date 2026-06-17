import { Eye, Lock, Mail, Phone, User } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const navigate = useNavigate();
  const { signUp, error, clearError } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "Омск",
    password: "",
    confirm: "",
  });

  useEffect(() => clearError, [clearError]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.password !== form.confirm) return;
    setSubmitting(true);
    try {
      await signUp({
        username: form.email,
        email: form.email,
        password: form.password,
        full_name: `${form.firstName} ${form.lastName}`.trim(),
        phone: form.phone,
        city: form.city,
      });
      navigate("/dashboard");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Регистрация">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="input-wrap"><User size={18} /><input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} placeholder="Имя" required /></label>
        <label className="input-wrap"><User size={18} /><input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} placeholder="Фамилия" required /></label>
        <label className="input-wrap"><Mail size={18} /><input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" placeholder="Email" required /></label>
        <label className="input-wrap"><Phone size={18} /><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Телефон" /></label>
        <label className="input-wrap"><User size={18} /><input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="Город" /></label>
        <label className="input-wrap"><Lock size={18} /><input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" placeholder="Пароль" minLength={8} required /><Eye size={17} /></label>
        <label className="input-wrap"><Lock size={18} /><input value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} type="password" placeholder="Подтвердите пароль" minLength={8} required /><Eye size={17} /></label>
        <label className="flex items-start gap-3 text-sm text-ink/70">
          <input type="checkbox" className="mt-1 h-4 w-4 rounded border-ink/20" required />
          <span>Я согласен(а) с правилами использования и политикой конфиденциальности</span>
        </label>
        {form.password && form.confirm && form.password !== form.confirm && <p className="text-sm font-bold text-red-600">Пароли не совпадают.</p>}
        {error && <p className="text-sm font-bold text-red-600">{error}</p>}
        <button className="btn btn-primary h-12 w-full" disabled={submitting} type="submit">
          {submitting ? "Создаем аккаунт..." : "Зарегистрироваться"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-ink/65">Уже есть аккаунт? <Link className="font-bold text-leaf-700" to="/login">Войти</Link></p>
    </AuthShell>
  );
}
