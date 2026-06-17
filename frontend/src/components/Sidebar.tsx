import { Heart, Home, LayoutDashboard, LogOut, MessageCircle, PackageCheck, PlusCircle, Settings, ShieldCheck, Shapes } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";

export function Sidebar() {
  const { isModerator, signOut } = useAuth();
  const navigate = useNavigate();

  const items = [
    { label: "Главная", icon: Home, to: "/" },
    { label: "Обзор", icon: LayoutDashboard, to: "/dashboard" },
    { label: "Мои объявления", icon: PackageCheck, to: "/dashboard/ads" },
    { label: "Отклики", icon: MessageCircle, to: "/dashboard/responses" },
    { label: "Сообщения", icon: MessageCircle, to: "/messages" },
    { label: "Избранное", icon: Heart, to: "/favorites" },
    { label: "Профиль", icon: Settings, to: "/profile" },
    { label: "Категории", icon: Shapes, to: "/categories" },
    { label: "Новое объявление", icon: PlusCircle, to: "/create-ad" },
  ];

  const navigationItems = isModerator
    ? [...items, { label: "Модерация", icon: ShieldCheck, to: "/moderation" }]
    : items;

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-leaf-100 bg-cream/80 px-6 py-7 lg:block">
      <Logo />
      <nav className="mt-9 space-y-2">
        {navigationItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            end={to === "/" || to === "/dashboard"}
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex h-12 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                isActive ? "bg-leaf-100 text-leaf-800" : "text-ink/72 hover:bg-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        <button
          className="flex h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold text-ink/72 transition hover:bg-white"
          onClick={() => void handleSignOut()}
          type="button"
        >
          <LogOut size={18} />
          Выход
        </button>
      </nav>
    </aside>
  );
}
