import { Filter, Search, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Ad, Category } from "../api/api";
import { addFavorite, getAds, getCategories, getErrorMessage, getFavorites, removeFavorite, sendComplaint, sendMessage, sendResponse } from "../api/api";
import { AdCard } from "../components/AdCard";
import { Header } from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { demoAds, demoCategories } from "../data/demo";

type Action = "response" | "complaint" | "message";

export function CatalogPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [ads, setAds] = useState<(Ad & { image?: string; owner?: string })[]>(demoAds);
  const [categories, setCategories] = useState<Category[]>(demoCategories);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    ad_type: searchParams.get("ad_type") || "",
    city: searchParams.get("city") || "",
  });
  const [active, setActive] = useState<{ type: Action; ad: Ad } | null>(null);
  const [text, setText] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Record<number, number>>({});
  const [favoriteBusyId, setFavoriteBusyId] = useState<number | null>(null);

  const params = useMemo(() => {
    return Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
  }, [filters]);

  async function loadAds(nextParams = params) {
    setLoading(true);
    try {
      const requests = [getAds(nextParams), getCategories()] as const;
      const [items, categoryItems] = await Promise.all(requests);
      setAds(items.length ? items : demoAds);
      setCategories(categoryItems.length ? categoryItems : demoCategories);
    } catch {
      setAds(demoAds);
      setCategories(demoCategories);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const nextFilters = {
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      ad_type: searchParams.get("ad_type") || "",
      city: searchParams.get("city") || "",
    };
    setFilters(nextFilters);
    void loadAds(Object.fromEntries(Object.entries(nextFilters).filter(([, value]) => value)));
  }, [searchParams]);

  useEffect(() => {
    if (!user) {
      setFavoriteIds({});
      return;
    }
    getFavorites()
      .then((items) => {
        setFavoriteIds(
          Object.fromEntries(items.map((item) => [item.ad, item.id])),
        );
      })
      .catch(() => setFavoriteIds({}));
  }, [user]);

  async function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchParams(params);
  }

  async function submitAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active) return;
    setError("");
    setNotice("");
    try {
      if (active.type === "response") {
        await sendResponse(active.ad.id, text);
        setNotice("Отклик отправлен. Он появится в личном кабинете.");
      }
      if (active.type === "complaint") {
        await sendComplaint(active.ad.id, text);
        setNotice("Жалоба отправлена модератору.");
      }
      if (active.type === "message") {
        if (!active.ad.user_id) throw new Error("У объявления нет автора для сообщения.");
        await sendMessage({ receiver: active.ad.user_id, ad: active.ad.id, text });
        setNotice("Сообщение отправлено автору объявления.");
      }
      setActive(null);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : getErrorMessage(err));
    }
  }

  function openAction(type: Action, ad: Ad) {
    setError("");
    setNotice("");
    if (!user) {
      setError("Войдите, чтобы выполнить это действие.");
      return;
    }
    if (ad.user_id === user.id && type !== "complaint") {
      setError("С собственным объявлением это действие недоступно.");
      return;
    }
    setActive({ type, ad });
  }

  function applyFilters(nextFilters: typeof filters) {
    setFilters(nextFilters);
    const nextParams = Object.fromEntries(Object.entries(nextFilters).filter(([, value]) => value));
    setSearchParams(nextParams);
  }

  async function toggleFavorite(ad: Ad) {
    if (!user) {
      setError("Войдите, чтобы добавлять объявления в избранное.");
      return;
    }
    setError("");
    setFavoriteBusyId(ad.id);
    try {
      const existingId = favoriteIds[ad.id];
      if (existingId) {
        await removeFavorite(existingId);
        setFavoriteIds((current) => {
          const next = { ...current };
          delete next[ad.id];
          return next;
        });
        setAds((current) => current.map((item) => item.id === ad.id ? { ...item, is_favorite: false } : item));
      } else {
        const favorite = await addFavorite(ad.id);
        setFavoriteIds((current) => ({ ...current, [ad.id]: favorite.id }));
        setAds((current) => current.map((item) => item.id === ad.id ? { ...item, is_favorite: true } : item));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setFavoriteBusyId(null);
    }
  }

  const actionTitle = active?.type === "response" ? "Отклик на объявление" : active?.type === "complaint" ? "Жалоба" : "Сообщение автору";

  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <Header />
      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-ink">Объявления</h1>
            <p className="mt-2 text-ink/60">
              Найдите нужную вещь по категории, городу и типу передачи или откройте
              {" "}
              <Link className="font-bold text-leaf-700" to="/categories">все категории</Link>.
            </p>
          </div>
        </div>
        <form className="mt-6 grid gap-3 md:grid-cols-[1fr_180px_180px_160px_auto]" onSubmit={submitFilters}>
          <label className="input-wrap bg-white"><Search size={18} /><input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Поиск по объявлениям..." /></label>
          <select className="field" value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
            <option value="">Все категории</option>
            {categories.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
          </select>
          <select className="field" value={filters.ad_type} onChange={(event) => setFilters({ ...filters, ad_type: event.target.value })}>
            <option value="">Любой тип</option>
            <option value="free">Бесплатно</option>
            <option value="exchange">Обмен</option>
          </select>
          <input className="field" value={filters.city} onChange={(event) => setFilters({ ...filters, city: event.target.value })} placeholder="Город" />
          <button className="btn btn-primary h-12 px-8" disabled={loading} type="submit">{loading ? "Ищем..." : "Поиск"}</button>
        </form>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            className={`chip ${!filters.search && !filters.category && !filters.ad_type && !filters.city ? "chip-active" : ""}`}
            type="button"
            onClick={() => {
              const reset = { search: "", category: "", ad_type: "", city: "" };
              applyFilters(reset);
            }}
          >
            Все
          </button>
          {categories.map((item) => (
            <button
              className={`chip ${filters.category === String(item.id) ? "chip-active" : ""}`}
              type="button"
              key={item.id}
              onClick={() => {
                applyFilters({ ...filters, category: String(item.id) });
              }}
            >
              {item.name} ({item.active_ads_count ?? 0})
            </button>
          ))}
          <span className="chip"><Filter size={14} /> {ads.length} найдено</span>
        </div>
        {notice && <p className="notice notice-success mt-5">{notice}</p>}
        {error && <p className="notice notice-error mt-5">{error}</p>}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ads.map((ad) => (
            <AdCard
              ad={ad}
              key={ad.id}
              onRespond={(item) => openAction("response", item)}
              onComplain={(item) => openAction("complaint", item)}
              onMessage={(item) => openAction("message", item)}
              onToggleFavorite={(item) => void toggleFavorite(item)}
              favoriteBusy={favoriteBusyId === ad.id}
            />
          ))}
        </div>
      </main>

      {active && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <form className="w-full max-w-md rounded-lg bg-white p-6 shadow-soft" onSubmit={submitAction}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">{actionTitle}</h2>
              <button type="button" className="icon-btn" onClick={() => setActive(null)}><X size={18} /></button>
            </div>
            <p className="mt-2 text-sm font-semibold text-ink/55">{active.ad.title}</p>
            <textarea className="field mt-5 min-h-32" value={text} onChange={(event) => setText(event.target.value)} required minLength={3} placeholder="Введите текст..." />
            <button className="btn btn-primary mt-5 h-12 w-full" type="submit">Отправить</button>
          </form>
        </div>
      )}
    </div>
  );
}
