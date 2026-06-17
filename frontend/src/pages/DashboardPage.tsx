import { MessageSquare, PackageCheck, Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteAd, getErrorMessage, getMyAds, getMyResponses, getResponsesToMyAds, type Ad, type AdResponse } from "../api/api";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { demoAds } from "../data/demo";

export function DashboardPage() {
  const { user } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [myResponses, setMyResponses] = useState<AdResponse[]>([]);
  const [incomingResponses, setIncomingResponses] = useState<AdResponse[]>([]);
  const [error, setError] = useState("");

  async function load() {
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
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function removeAd(id: number) {
    try {
      await deleteAd(id);
      setAds((items) => items.filter((item) => item.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const stats = [
    [String(ads.length), "Мои объявления", Star],
    [String(ads.filter((item) => item.status === "active").length), "Активные объявления", PackageCheck],
    [String(incomingResponses.length), "Отклики на мои", MessageSquare],
    [String(myResponses.length), "Мои отклики", MessageSquare],
  ];

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="flex-1 bg-[#fffdf7] p-6 lg:p-10">
        <section className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <img className="h-24 w-24 rounded-full object-cover ring-8 ring-leaf-50" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80" alt="Пользователь" />
              <div>
                <h1 className="text-3xl font-black text-ink">Здравствуйте, {user?.profile?.full_name || user?.username || "гость"}!</h1>
                <p className="mt-2 text-ink/65">{user?.email || "Войдите, чтобы видеть свои объявления"}</p>
              </div>
            </div>
            <Link to="/create-ad" className="btn btn-primary h-12 px-5"><Plus size={18} />Разместить</Link>
          </div>
          {error && <p className="notice notice-error mt-6">{error}</p>}
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map(([value, label, Icon]) => (
              <div className="rounded-lg bg-white p-5 text-center shadow-card" key={label as string}>
                <Icon className="mx-auto mb-2 text-leaf-700" size={20} />
                <strong className="block text-2xl font-black">{value as string}</strong>
                <span className="text-sm font-semibold text-ink/60">{label as string}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Мои объявления</h2>
            <Link className="text-sm font-bold text-leaf-700" to="/catalog">Каталог</Link>
          </div>
          <div className="mt-5 space-y-4">
            {ads.map((ad) => (
              <article className="flex items-center gap-5 rounded-lg bg-white p-4 shadow-card" key={ad.id}>
                <div className="grid h-24 w-24 place-items-center rounded-lg bg-leaf-50 text-leaf-700">
                  <PackageCheck size={32} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-extrabold">{ad.title}</h3>
                  <p className="text-sm text-ink/55">{ad.category_detail?.name || "Категория"} • {ad.city}</p>
                  <p className="mt-1 line-clamp-1 text-sm text-ink/50">{ad.description}</p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-leaf-100 px-4 py-2 text-sm font-bold text-leaf-700">{ad.status}</span>
                  <button className="mt-3 flex items-center gap-1 text-sm font-bold text-red-600" type="button" onClick={() => void removeAd(ad.id)}><Trash2 size={15} />Удалить</button>
                </div>
              </article>
            ))}
            {!ads.length && <p className="rounded-lg bg-white p-6 text-center font-semibold text-ink/55 shadow-card">У вас пока нет объявлений.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
