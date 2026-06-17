import { ArrowRight, BookOpen, Camera, HandHeart, PackagePlus, Shirt, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories, type Category } from "../api/api";
import { Header } from "../components/Header";
import { demoCategories } from "../data/demo";

const icons = [Shirt, PackagePlus, HandHeart, BookOpen, Camera, Sparkles];

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(demoCategories);

  useEffect(() => {
    getCategories()
      .then((items) => setCategories(items.length ? items : demoCategories))
      .catch(() => setCategories(demoCategories));
  }, []);

  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <Header />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <section className="rounded-[28px] border border-leaf-100 bg-white p-8 shadow-card">
          <h1 className="text-4xl font-black text-ink">Категории вещей</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink/65">
            Здесь проще понять, что именно можно отдать, обменять или найти для семьи. Каждая карточка ведет в каталог уже с нужным фильтром.
          </p>
        </section>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const Icon = icons[index % icons.length] || Sparkles;
            return (
              <Link
                className="group rounded-[24px] border border-black/5 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-soft"
                key={category.id}
                to={`/catalog?category=${category.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-leaf-50 text-leaf-700">
                    <Icon size={28} />
                  </div>
                  <span className="rounded-full bg-leaf-50 px-3 py-1 text-xs font-bold text-leaf-700">
                    {category.active_ads_count ?? 0} активных
                  </span>
                </div>
                <h2 className="mt-5 text-xl font-extrabold text-ink">{category.name}</h2>
                <p className="mt-2 text-sm leading-6 text-ink/65">{category.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-leaf-700">
                  Смотреть объявления
                  <ArrowRight size={16} />
                </span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
