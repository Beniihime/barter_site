import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { getComplaints, getErrorMessage, updateMyProfile, type Complaint } from "../api/api";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

export function ProfilePage() {
  const { user, refresh } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    city: "",
  });

  useEffect(() => {
    setForm({
      full_name: user?.profile?.full_name || "",
      phone: user?.profile?.phone || "",
      city: user?.profile?.city || "",
    });
  }, [user]);

  useEffect(() => {
    getComplaints()
      .then((items) => setComplaints(items.filter((item) => item.user === user?.username)))
      .catch(() => setComplaints([]));
  }, [user?.username]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");
    setSaving(true);
    try {
      await updateMyProfile(form);
      await refresh();
      setNotice("Профиль обновлен.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="flex-1 bg-[#fffdf7] p-6 lg:p-10">
        <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[28px] bg-white p-6 shadow-card">
            <h1 className="text-3xl font-black text-ink">Профиль</h1>
            <p className="mt-2 text-ink/65">Обновите контакты, чтобы с вами было проще договориться о передаче вещей.</p>

            <div className="mt-6 rounded-2xl bg-[#fffdf9] p-5">
              <p className="text-sm font-semibold text-ink/55">Роль на платформе</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-leaf-100 text-leaf-700">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="font-bold">{user?.profile?.role?.name || "user"}</p>
                  <p className="text-sm text-ink/60">{user?.profile?.role?.description || "Пользователь платформы"}</p>
                </div>
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="form-label">Полное имя</span>
                <input className="field" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} required />
              </label>
              <label className="block">
                <span className="form-label">Телефон</span>
                <input className="field" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+7 ..." />
              </label>
              <label className="block">
                <span className="form-label">Город</span>
                <input className="field" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
              </label>
              {notice && <p className="notice notice-success flex items-center gap-2"><CheckCircle2 size={18} />{notice}</p>}
              {error && <p className="notice notice-error">{error}</p>}
              <button className="btn btn-primary h-12 px-6" disabled={saving} type="submit">
                {saving ? "Сохраняем..." : "Сохранить изменения"}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] bg-white p-6 shadow-card">
              <h2 className="text-xl font-extrabold">Аккаунт</h2>
              <div className="mt-4 space-y-3 text-sm">
                <p><span className="font-bold">Логин:</span> {user?.username}</p>
                <p><span className="font-bold">Email:</span> {user?.email}</p>
                <p><span className="font-bold">Город:</span> {user?.profile?.city || "Не указан"}</p>
              </div>
            </section>

            <section className="rounded-[28px] bg-white p-6 shadow-card">
              <h2 className="text-xl font-extrabold">Мои жалобы</h2>
              <div className="mt-4 space-y-3">
                {complaints.map((item) => (
                  <article className="rounded-xl border border-black/5 bg-[#fffdf9] p-4" key={item.id}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold">{item.ad_title}</p>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">{item.status}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink/65">{item.reason}</p>
                    {item.moderator_comment && <p className="mt-2 text-sm text-leaf-800">Комментарий: {item.moderator_comment}</p>}
                  </article>
                ))}
                {!complaints.length && <p className="text-sm font-semibold text-ink/55">Жалоб пока нет.</p>}
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
