import { ArrowLeft, CheckCircle2, ImagePlus, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createAd, getCategories, getErrorMessage, type Category } from "../api/api";
import { demoCategories } from "../data/demo";

export function CreateAdPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>(demoCategories);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    ad_type: "free",
    category: "",
    title: "",
    description: "",
    item_condition: "used",
    exchange_request: "",
    city: "Омск",
  });

  useEffect(() => {
    getCategories().then((items) => {
      setCategories(items.length ? items : demoCategories);
      if (items[0]) setForm((current) => ({ ...current, category: String(items[0].id) }));
    }).catch(() => {
      setCategories(demoCategories);
      setForm((current) => ({ ...current, category: String(demoCategories[0].id) }));
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");
    setSubmitting(true);
    try {
      await createAd({
        ...form,
        category: Number(form.category),
        ad_type: form.ad_type as "free" | "exchange",
      });
      setNotice("Объявление создано и отправлено на модерацию.");
      window.setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fffdf9] px-5 py-8">
      <section className="mx-auto max-w-3xl">
        <div className="mb-7 grid grid-cols-[40px_1fr_40px] items-center">
          <Link to="/" className="grid h-10 w-10 place-items-center rounded-full hover:bg-leaf-50"><ArrowLeft /></Link>
          <h1 className="text-center text-2xl font-black">Создание объявления</h1>
        </div>
        <form className="space-y-5 rounded-lg bg-white p-6 shadow-card" onSubmit={handleSubmit}>
          <div>
            <label className="form-label">Тип объявления</label>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" className={`choice ${form.ad_type === "free" ? "active" : ""}`} onClick={() => setForm({ ...form, ad_type: "free", exchange_request: "" })}>Отдаю бесплатно</button>
              <button type="button" className={`choice ${form.ad_type === "exchange" ? "active" : ""}`} onClick={() => setForm({ ...form, ad_type: "exchange" })}>Меняю</button>
            </div>
          </div>
          <label className="block">
            <span className="form-label">Категория</span>
            <select className="field" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required>
              {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label className="block"><span className="form-label">Название</span><input className="field" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Кратко опишите вещь" minLength={5} required /></label>
          <label className="block"><span className="form-label">Описание</span><textarea className="field min-h-28" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Подробное описание состояния и особенностей вещи" minLength={20} required /></label>
          <label className="block">
            <span className="form-label">Состояние</span>
            <select className="field" value={form.item_condition} onChange={(event) => setForm({ ...form, item_condition: event.target.value })}>
              <option value="new">Новое</option>
              <option value="like_new">Как новое</option>
              <option value="used">Б/у</option>
              <option value="needs_repair">Требует ремонта</option>
            </select>
          </label>
          {form.ad_type === "exchange" && (
            <label className="block"><span className="form-label">Что нужно взамен</span><input className="field" value={form.exchange_request} onChange={(event) => setForm({ ...form, exchange_request: event.target.value })} placeholder="Например: книги, одежда, игрушки" required /></label>
          )}
          <div>
            <span className="form-label">Фото</span>
            <div className="grid grid-cols-4 gap-3">
              <button type="button" className="upload-tile"><ImagePlus /><span>Добавить фото</span></button>
              {["https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=300&q=80", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80", "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=300&q=80"].map((src) => (
                <div className="relative aspect-square overflow-hidden rounded-lg" key={src}>
                  <img src={src} alt="Фото" className="h-full w-full object-cover" />
                  <button type="button" className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink text-white"><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>
          <label className="block"><span className="form-label">Местоположение</span><input className="field" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="Город" required /></label>
          {notice && <p className="notice notice-success flex items-center gap-2"><CheckCircle2 size={18} />{notice}</p>}
          {error && <p className="notice notice-error">{error}</p>}
          <button className="btn btn-primary h-12 w-full" disabled={submitting} type="submit">
            {submitting ? "Публикуем..." : "Опубликовать объявление"}
          </button>
        </form>
      </section>
    </main>
  );
}
