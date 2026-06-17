import { Filter, Search, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Ad, Category } from "../api/api";
import { getAds, getCategories, getErrorMessage, sendComplaint, sendMessage, sendResponse } from "../api/api";
import { AdCard } from "../components/AdCard";
import { Header } from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { demoAds, demoCategories } from "../data/demo";

type Action = "response" | "complaint" | "message";

export function CatalogPage() {
  const { user } = useAuth();
  const [ads, setAds] = useState<(Ad & { image?: string; owner?: string })[]>(demoAds);
  const [categories, setCategories] = useState<Category[]>(demoCategories);
  const [filters, setFilters] = useState({ search: "", category: "", ad_type: "", city: "" });
  const [active, setActive] = useState<{ type: Action; ad: Ad } | null>(null);
  const [text, setText] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const params = useMemo(() => {
    return Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
  }, [filters]);

  async function loadAds(nextParams = params) {
    setLoading(true);
    try {
      const [items, categoryItems] = await Promise.all([getAds(nextParams), getCategories()]);
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
    void loadAds({});
  }, []);

  async function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadAds(params);
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

  const actionTitle = active?.type === "response" ? "Отклик на объявление" : active?.type === "complaint" ? "Жалоба" : "Сообщение автору";

  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <Header />
      <main className="mx-auto max-w-6xl px-5 py-8">
        <h1 className="text-3xl font-black text-ink">Объявления</h1>
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
          <button className="chip chip-active" type="button" onClick={() => setFilters({ search: "", category: "", ad_type: "", city: "" })}>Все</button>
          {categories.map((item) => (
            <button className="chip" type="button" key={item.id} onClick={() => setFilters({ ...filters, category: String(item.id) })}>{item.name}</button>
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
              onRespond={(item) => user ? setActive({ type: "response", ad: item }) : setError("Войдите, чтобы отправить отклик.")}
              onComplain={(item) => user ? setActive({ type: "complaint", ad: item }) : setError("Войдите, чтобы отправить жалобу.")}
              onMessage={(item) => user ? setActive({ type: "message", ad: item }) : setError("Войдите, чтобы написать автору.")}
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
