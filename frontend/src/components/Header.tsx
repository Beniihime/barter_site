import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";

const links = [
  ["Главная", "/"],
  ["Объявления", "/catalog"],
  ["Категории", "/categories"],
  ["Как это работает", "/how-it-works"],
  ["О нас", "/about"],
];

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/86 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-semibold text-ink/75 md:flex">
          {links.map(([label, href]) => (
            <NavLink key={label} to={href} className="transition hover:text-leaf-700">
              {label}
            </NavLink>
          ))}
        </nav>
        {user ? (
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link className="btn btn-ghost px-3 sm:px-4" to="/dashboard">
              {user.profile?.full_name?.split(" ")[0] || user.username}
            </Link>
            <button className="btn btn-primary px-3 sm:px-4" type="button" onClick={() => void handleSignOut()}>
              Выйти
            </button>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link className="btn btn-ghost px-3 sm:px-4" to="/login">Войти</Link>
            <Link className="btn btn-primary px-3 sm:px-4" to="/register">Регистрация</Link>
          </div>
        )}
      </div>
    </header>
  );
}
