import { ArrowLeft, CheckCircle2, ImagePlus, LoaderCircle, X } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createAd, getAd, getCategories, getErrorMessage, type Ad, type Category, updateAd, uploadAdImage } from "../api/api";
import { demoCategories } from "../data/demo";

type UploadPreview = {
  id: string;
  file?: File;
  preview: string;
  uploaded?: boolean;
};

export function CreateAdPage() {
  const navigate = useNavigate();
  const params = useParams();
  const adId = Number(params.id);
  const isEditing = Number.isFinite(adId);
  const uploadsRef = useRef<UploadPreview[]>([]);
  const [categories, setCategories] = useState<Category[]>(demoCategories);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [uploads, setUploads] = useState<UploadPreview[]>([]);
  const [existingImages, setExistingImages] = useState<Ad["images"]>([]);
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
    async function loadInitialData() {
      try {
        const categoryItems = await getCategories();
        const resolvedCategories = categoryItems.length ? categoryItems : demoCategories;
        setCategories(resolvedCategories);
        setForm((current) => ({
          ...current,
          category: current.category || String(resolvedCategories[0]?.id || ""),
        }));

        if (isEditing) {
          const ad = await getAd(adId);
          setForm({
            ad_type: ad.ad_type,
            category: String(ad.category),
            title: ad.title,
            description: ad.description,
            item_condition: ad.item_condition,
            exchange_request: ad.exchange_request,
            city: ad.city,
          });
          setExistingImages(ad.images || []);
        }
      } catch (err) {
        setError(getErrorMessage(err));
        setCategories(demoCategories);
      } finally {
        setLoading(false);
      }
    }

    void loadInitialData();
  }, [adId, isEditing]);

  useEffect(() => {
    uploadsRef.current = uploads;
  }, [uploads]);

  useEffect(() => {
    return () => {
      uploadsRef.current.forEach((item) => {
        if (item.file) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, []);

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []).slice(0, Math.max(0, 6 - uploads.length));
    if (!files.length) return;
    const nextItems = files.map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    setUploads((current) => [...current, ...nextItems]);
    event.target.value = "";
  }

  function removeUpload(id: string) {
    setUploads((current) => {
      const item = current.find((entry) => entry.id === id);
      if (item?.file) {
        URL.revokeObjectURL(item.preview);
      }
      return current.filter((entry) => entry.id !== id);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        category: Number(form.category),
        ad_type: form.ad_type as "free" | "exchange",
      };
      const ad = isEditing
        ? await updateAd(adId, payload)
        : await createAd(payload);
      await Promise.all(
        uploads
          .filter((item) => item.file)
          .map((item) => uploadAdImage(ad.id, item.file as File)),
      );
      setNotice(isEditing ? "Изменения сохранены. Объявление отправлено на повторную модерацию." : "Объявление создано и отправлено на модерацию.");
      window.setTimeout(() => navigate("/dashboard/ads"), 900);
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
          <Link to={isEditing ? "/dashboard/ads" : "/"} className="grid h-10 w-10 place-items-center rounded-full hover:bg-leaf-50"><ArrowLeft /></Link>
          <h1 className="text-center text-2xl font-black">{isEditing ? "Редактирование объявления" : "Создание объявления"}</h1>
        </div>
        {loading ? (
          <div className="rounded-lg bg-white p-8 text-center font-semibold text-ink/60 shadow-card">Загружаем объявление...</div>
        ) : (
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
              <label className="upload-tile cursor-pointer">
                <ImagePlus />
                <span>Добавить фото</span>
                <input accept="image/png,image/jpeg,image/webp" className="hidden" multiple onChange={handleFiles} type="file" />
              </label>
              {uploads.map((item) => (
                <div className="relative aspect-square overflow-hidden rounded-lg" key={item.id}>
                  <img src={item.preview} alt="Предпросмотр" className="h-full w-full object-cover" />
                  <button type="button" className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink text-white" onClick={() => removeUpload(item.id)}><X size={14} /></button>
                </div>
              ))}
              {existingImages?.map((item) => (
                <div className="relative aspect-square overflow-hidden rounded-lg" key={item.id}>
                  <img src={item.image} alt="Загруженное фото" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs font-semibold text-ink/50">Можно добавить до 6 новых изображений в форматах JPG, PNG или WEBP.</p>
          </div>
          <label className="block"><span className="form-label">Местоположение</span><input className="field" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="Город" required /></label>
          {notice && <p className="notice notice-success flex items-center gap-2"><CheckCircle2 size={18} />{notice}</p>}
          {error && <p className="notice notice-error">{error}</p>}
          <button className="btn btn-primary h-12 w-full" disabled={submitting} type="submit">
            {submitting ? <><LoaderCircle className="animate-spin" size={18} />Сохраняем...</> : isEditing ? "Сохранить изменения" : "Опубликовать объявление"}
          </button>
        </form>
        )}
      </section>
    </main>
  );
}
