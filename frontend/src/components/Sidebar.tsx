import { Heart, Home, Inbox, LayoutDashboard, LogOut, MessageCircle, PackageCheck, Settings, ShieldCheck } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Logo } from "./Logo";

const items = [
  { label: "Главная", icon: Home, to: "/" },
  { label: "Мои объявления", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Сообщения", icon: MessageCircle, to: "/messages", badge: "3" },
  { label: "Избранное", icon: Heart, to: "/catalog" },
  { label: "Статус заявки", icon: PackageCheck, to: "/dashboard" },
  { label: "Модерация", icon: ShieldCheck, to: "/moderation" },
  { label: "Настройки", icon: Settings, to: "/dashboard" },
  { label: "Выход", icon: LogOut, to: "/login" },
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-leaf-100 bg-cream/80 px-6 py-7 lg:block">
      <Logo />
      <nav className="mt-9 space-y-2">
        {items.map(({ label, icon: Icon, to, badge }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex h-12 items-center justify-between rounded-lg px-3 text-sm font-semibold transition ${
                isActive ? "bg-leaf-100 text-leaf-800" : "text-ink/72 hover:bg-white"
              }`
            }
          >
            <span className="flex items-center gap-3">
              <Icon size={18} />
              {label}
            </span>
            {badge && <span className="rounded-full bg-leaf-600 px-2 py-0.5 text-xs text-white">{badge}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
