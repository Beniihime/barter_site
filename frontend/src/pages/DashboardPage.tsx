import { ArrowRight, LayoutDashboard, MessageSquare, PackageCheck, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  deleteAd,
  getErrorMessage,
  getMyAds,
  getMyResponses,
  getResponsesToMyAds,
  type Ad,
  type AdResponse,
} from "../api/api";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { demoAds } from "../data/demo";

type DashboardSection = "overview" | "ads" | "responses";

export function DashboardPage({ section }: { section: DashboardSection }) {
  const { user } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [myResponses, setMyResponses] = useState<AdResponse[]>([]);
  const [incomingResponses, setIncomingResponses] = useState<AdResponse[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    async function load() {
      setError("");
      try {
        const [myAds, outgoing, incoming] = await Promise.all([
          getMyAds(),
          getMyResponses(),
          getResponsesToMyAds(),
        ]);
        setAds(myAds);
        setMyResponses(outgoing);
        setIncomingResponses(incoming);
      } catch (err) {
        setError(getErrorMessage(err));
        setAds(demoAds);
        setMyResponses([]);
        setIncomingResponses([]);
      }
    }

    void load();
  }, []);

  async function removeAd(id: number) {
    setError("");
    setNotice("");
    try {
      await deleteAd(id);
      setAds((items) => items.filter((item) => item.id !== id));
      setNotice("Объявление удалено.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const stats = useMemo(
    () => [
      [String(ads.length), "Мои объявления", Star],
      [String(ads.filter((item) => item.status === "active").length), "Активные объявления", PackageCheck],
      [String(incomingResponses.length), "Отклики на мои", MessageSquare],
      [String(myResponses.length), "Мои отклики", MessageSquare],
    ],
    [ads, incomingResponses.length, myResponses.length],
  );

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="flex-1 bg-[#fffdf7] p-6 lg:p-10">
        <section className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 rounded-[28px] bg-white p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-leaf-50 text-3xl font-black text-leaf-700 ring-8 ring-leaf-50">
                {(user?.profile?.full_name || user?.username || "Г").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-black text-ink">
                  {user?.profile?.full_name || user?.username || "Личный кабинет"}
                </h1>
                <p className="mt-2 text-ink/65">{user?.email || "Войдите, чтобы видеть свои объявления"}</p>
                <p className="mt-1 text-sm font-semibold text-leaf-700">
                  {user?.profile?.city || "Город не указан"} • {user?.profile?.role?.description || "Пользователь платформы"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/profile" className="btn btn-outline h-12 px-5">Редактировать профиль</Link>
              <Link to="/create-ad" className="btn btn-primary h-12 px-5"><Plus size={18} />Разместить</Link>
            </div>
          </div>

          {notice && <p className="notice notice-success mt-6">{notice}</p>}
          {error && <p className="notice notice-error mt-6">{error}</p>}

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map(([value, label, Icon]) => (
              <div className="rounded-2xl bg-white p-5 text-center shadow-card" key={label as string}>
                <Icon className="mx-auto mb-2 text-leaf-700" size={20} />
                <strong className="block text-2xl font-black">{value as string}</strong>
                <span className="text-sm font-semibold text-ink/60">{label as string}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <SectionLink active={section === "overview"} icon={<LayoutDashboard size={16} />} label="Обзор" to="/dashboard" />
            <SectionLink active={section === "ads"} icon={<PackageCheck size={16} />} label="Мои объявления" to="/dashboard/ads" />
            <SectionLink active={section === "responses"} icon={<MessageSquare size={16} />} label="Отклики" to="/dashboard/responses" />
          </div>

          {section === "overview" && (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-2xl bg-white p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold">Последние объявления</h2>
                  <Link className="text-sm font-bold text-leaf-700" to="/dashboard/ads">Смотреть все</Link>
                </div>
                <div className="mt-5 space-y-4">
                  {ads.slice(0, 3).map((ad) => (
                    <article className="flex items-center gap-5 rounded-xl border border-black/5 bg-[#fffdf9] p-4" key={ad.id}>
                      <div className="grid h-20 w-20 place-items-center rounded-lg bg-leaf-50 text-leaf-700">
                        <PackageCheck size={28} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-extrabold">{ad.title}</h3>
                        <p className="text-sm text-ink/55">{ad.category_detail?.name || "Категория"} • {ad.city}</p>
                        <p className="mt-1 line-clamp-1 text-sm text-ink/50">{ad.description}</p>
                      </div>
                      <span className="rounded-full bg-leaf-100 px-4 py-2 text-sm font-bold text-leaf-700">{ad.status}</span>
                    </article>
                  ))}
                  {!ads.length && <p className="text-sm font-semibold text-ink/55">У вас пока нет объявлений.</p>}
                </div>
              </section>

              <section className="rounded-2xl bg-white p-6 shadow-card">
                <h2 className="text-xl font-extrabold">Быстрые действия</h2>
                <div className="mt-5 grid gap-3">
                  <Link className="rounded-xl border border-black/5 bg-[#fffdf9] p-4 font-bold transition hover:border-leaf-200 hover:bg-leaf-50" to="/create-ad">
                    Разместить новое объявление
                  </Link>
                  <Link className="rounded-xl border border-black/5 bg-[#fffdf9] p-4 font-bold transition hover:border-leaf-200 hover:bg-leaf-50" to="/messages">
                    Проверить сообщения и договоренности
                  </Link>
                  <Link className="rounded-xl border border-black/5 bg-[#fffdf9] p-4 font-bold transition hover:border-leaf-200 hover:bg-leaf-50" to="/profile">
                    Обновить контакты и город
                  </Link>
                  <Link className="rounded-xl border border-black/5 bg-[#fffdf9] p-4 font-bold transition hover:border-leaf-200 hover:bg-leaf-50" to="/catalog">
                    Посмотреть новые объявления в каталоге
                  </Link>
                </div>
              </section>
            </div>
          )}

          {section === "ads" && (
            <section className="mt-8 rounded-2xl bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold">Мои объявления</h2>
                <Link className="text-sm font-bold text-leaf-700" to="/catalog">Перейти в каталог</Link>
              </div>
              <div className="mt-5 space-y-4">
                {ads.map((ad) => (
                  <article className="flex flex-col gap-4 rounded-xl border border-black/5 bg-[#fffdf9] p-4 md:flex-row md:items-center" key={ad.id}>
                    <div className="grid h-24 w-24 place-items-center rounded-lg bg-leaf-50 text-leaf-700">
                      <PackageCheck size={32} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-extrabold">{ad.title}</h3>
                      <p className="text-sm text-ink/55">{ad.category_detail?.name || "Категория"} • {ad.city}</p>
                      <p className="mt-1 text-sm leading-6 text-ink/60">{ad.description}</p>
                    </div>
                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <span className="rounded-full bg-leaf-100 px-4 py-2 text-sm font-bold text-leaf-700">{ad.status}</span>
                      <Link className="text-sm font-bold text-leaf-700" to={`/ads/${ad.id}/edit`}>
                        <span className="inline-flex items-center gap-1"><Pencil size={14} />Редактировать</span>
                      </Link>
                      <button className="flex items-center gap-1 text-sm font-bold text-red-600" type="button" onClick={() => void removeAd(ad.id)}>
                        <Trash2 size={15} />
                        Удалить
                      </button>
                    </div>
                  </article>
                ))}
                {!ads.length && <p className="text-sm font-semibold text-ink/55">У вас пока нет объявлений.</p>}
              </div>
            </section>
          )}

          {section === "responses" && (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl bg-white p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold">Отклики на мои объявления</h2>
                  <Link className="text-sm font-bold text-leaf-700" to="/messages">Открыть чат</Link>
                </div>
                <div className="mt-4 space-y-3">
                  {incomingResponses.map((item) => (
                    <article className="rounded-xl border border-black/5 bg-[#fffdf9] p-4" key={item.id}>
                      <p className="font-bold">{item.ad_title}</p>
                      <p className="mt-1 text-sm text-ink/65">{item.user}</p>
                      <p className="mt-2 text-sm leading-6 text-ink/70">{item.text}</p>
                    </article>
                  ))}
                  {!incomingResponses.length && <p className="text-sm font-semibold text-ink/55">Пока никто не откликнулся.</p>}
                </div>
              </section>

              <section className="rounded-2xl bg-white p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold">Мои отклики</h2>
                  <Link className="inline-flex items-center gap-1 text-sm font-bold text-leaf-700" to="/catalog">
                    Найти ещё
                    <ArrowRight size={16} />
                  </Link>
                </div>
                <div className="mt-4 space-y-3">
                  {myResponses.map((item) => (
                    <article className="rounded-xl border border-black/5 bg-[#fffdf9] p-4" key={item.id}>
                      <p className="font-bold">{item.ad_title}</p>
                      <p className="mt-2 text-sm leading-6 text-ink/70">{item.text}</p>
                      <span className="mt-3 inline-flex rounded-full bg-leaf-50 px-3 py-1 text-xs font-bold text-leaf-700">{item.status}</span>
                    </article>
                  ))}
                  {!myResponses.length && <p className="text-sm font-semibold text-ink/55">Вы пока никуда не откликались.</p>}
                </div>
              </section>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function SectionLink({ active, icon, label, to }: { active: boolean; icon: ReactNode; label: string; to: string }) {
  return (
    <Link
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
        active ? "bg-leaf-700 text-white" : "bg-white text-ink shadow-card hover:bg-leaf-50"
      }`}
      to={to}
    >
      {icon}
      {label}
    </Link>
  );
}
