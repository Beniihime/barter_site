import { CheckCircle2, EyeOff, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getComplaints, getErrorMessage, getModerationQueue, moderateAd, processComplaint, type Ad, type Complaint } from "../api/api";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

export function ModerationPage() {
  const { isModerator } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const [queue, complaintItems] = await Promise.all([getModerationQueue(), getComplaints()]);
      setAds(queue);
      setComplaints(complaintItems);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleModeration(id: number, action: "approve" | "reject" | "hide") {
    setError("");
    try {
      await moderateAd(id, action);
      setAds((items) => items.filter((item) => item.id !== id));
      setNotice("Решение по объявлению сохранено.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function closeComplaint(id: number) {
    setError("");
    try {
      await processComplaint(id, { status: "closed", moderator_comment: "Обращение обработано." });
      setComplaints((items) => items.filter((item) => item.id !== id));
      setNotice("Жалоба закрыта.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="flex-1 bg-[#fffdf9] p-6 lg:p-10">
        <section className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-black">Панель модератора</h1>
          {!isModerator && <p className="notice notice-error mt-5">Для этого раздела нужен модератор или администратор.</p>}
          {notice && <p className="notice notice-success mt-5">{notice}</p>}
          {error && <p className="notice notice-error mt-5">{error}</p>}
          <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-leaf-50 text-ink/70">
                <tr>
                  <th className="px-5 py-4">Объявление</th>
                  <th className="px-5 py-4">Категория</th>
                  <th className="px-5 py-4">Город</th>
                  <th className="px-5 py-4">Статус</th>
                  <th className="px-5 py-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => (
                  <tr className="border-t border-black/5" key={ad.id}>
                    <td className="px-5 py-4 font-bold">{ad.title}</td>
                    <td className="px-5 py-4">{ad.category_detail?.name}</td>
                    <td className="px-5 py-4">{ad.city}</td>
                    <td className="px-5 py-4"><span className="rounded-full bg-amber-100 px-3 py-1 font-bold text-amber-700">{ad.status}</span></td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button className="icon-btn text-leaf-700" type="button" onClick={() => void handleModeration(ad.id, "approve")}><CheckCircle2 size={18} /></button>
                        <button className="icon-btn text-red-600" type="button" onClick={() => void handleModeration(ad.id, "reject")}><XCircle size={18} /></button>
                        <button className="icon-btn text-ink/65" type="button" onClick={() => void handleModeration(ad.id, "hide")}><EyeOff size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!ads.length && <tr><td className="px-5 py-8 text-center font-semibold text-ink/55" colSpan={5}>Нет объявлений на модерации.</td></tr>}
              </tbody>
            </table>
          </div>

          <h2 className="mt-10 text-2xl font-black">Жалобы</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {complaints.map((item) => (
              <article className="rounded-lg bg-white p-5 shadow-card" key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold">{item.ad_title}</h3>
                    <p className="mt-1 text-sm text-ink/60">{item.reason}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">{item.status}</span>
                </div>
                <button className="btn btn-primary mt-4 h-10 px-4" type="button" onClick={() => void closeComplaint(item.id)}>Закрыть жалобу</button>
              </article>
            ))}
            {!complaints.length && <p className="rounded-lg bg-white p-6 text-center font-semibold text-ink/55 shadow-card">Открытых жалоб нет.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
