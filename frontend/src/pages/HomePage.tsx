import { BookOpen, Camera, HandHeart, PackagePlus, Shirt, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { demoCategories } from "../data/demo";

const icons = [Shirt, PackagePlus, HandHeart, BookOpen, Camera, Sparkles];

export function HomePage() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="mx-auto max-w-7xl px-5 pb-10 pt-10 lg:px-8">
        <section className="hero-panel grid min-h-[520px] grid-cols-1 overflow-hidden rounded-lg border border-leaf-100 bg-white lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative z-10 flex flex-col justify-center px-8 py-12 lg:px-14">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl text-5xl font-black leading-[1.05] text-ink md:text-6xl"
            >
              Давайте делать добрые дела вместе
            </motion.h1>
            <p className="mt-6 max-w-md text-lg font-medium leading-7 text-ink/70">
              Платформа для обмена вещами между нуждающимися и людьми, готовыми помочь.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/create-ad" className="btn btn-primary h-12 px-6">Разместить объявление</Link>
              <Link to="/catalog" className="btn btn-outline h-12 px-6">Найти вещь</Link>
            </div>
          </div>
          <div className="relative min-h-[360px]">
            <div className="hero-art">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="heart-orb">
                <HandHeart size={98} strokeWidth={1.8} />
              </motion.div>
              <div className="hand hand-top" />
              <div className="hand hand-bottom" />
              <div className="leaf leaf-a" />
              <div className="leaf leaf-b" />
              <div className="leaf leaf-c" />
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-extrabold text-ink">Популярные категории</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {demoCategories.map((category, index) => {
              const Icon = icons[index] || Sparkles;
              return (
                <Link key={category.id} to="/catalog" className="category-tile">
                  <Icon size={38} strokeWidth={1.8} />
                  <strong>{category.name}</strong>
                  <span>{category.description}</span>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
