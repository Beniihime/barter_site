import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage, getFavorites, removeFavorite, type Favorite } from "../api/api";
import { AdCard } from "../components/AdCard";
import { Sidebar } from "../components/Sidebar";

export function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    getFavorites()
      .then((items) => setFavorites(items))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  async function toggleFavorite(item: Favorite) {
    setBusyId(item.ad_detail.id);
    setError("");
    try {
      await removeFavorite(item.id);
      setFavorites((current) => current.filter((entry) => entry.id !== item.id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="flex-1 bg-[#fffdf7] p-6 lg:p-10">
        <section className="mx-auto max-w-6xl">
          <div className="rounded-[28px] bg-white p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
                <Heart size={22} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-ink">Избранное</h1>
                <p className="mt-1 text-ink/60">Собранные объявления, к которым вы хотите вернуться позже.</p>
              </div>
            </div>
          </div>

          {error && <p className="notice notice-error mt-6">{error}</p>}

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => (
              <AdCard
                ad={{ ...favorite.ad_detail, is_favorite: true }}
                favoriteBusy={busyId === favorite.ad_detail.id}
                key={favorite.id}
                onToggleFavorite={() => void toggleFavorite(favorite)}
              />
            ))}
          </div>

          {!favorites.length && (
            <div className="mt-6 rounded-[28px] bg-white p-8 text-center shadow-card">
              <p className="font-semibold text-ink/60">В избранном пока пусто.</p>
              <Link className="btn btn-primary mt-4 px-5" to="/catalog">Перейти в каталог</Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
