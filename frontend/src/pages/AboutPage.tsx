import { HeartHandshake, Scale, Users } from "lucide-react";
import { Header } from "../components/Header";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <Header />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <section className="rounded-[28px] border border-leaf-100 bg-white p-8 shadow-card">
          <h1 className="text-4xl font-black text-ink">О проекте</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/65">
            ДоброРядом создан как локальная площадка для бережного обмена и безвозмездной передачи вещей. Мы хотим, чтобы хорошие вещи не пылились без дела, а быстро находили нового хозяина.
          </p>
        </section>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <ValueCard
            icon={HeartHandshake}
            title="Забота"
            text="Помогаем упростить передачу вещей тем, кому они сейчас особенно нужны."
          />
          <ValueCard
            icon={Users}
            title="Сообщество"
            text="Проект строится вокруг доверия, диалога и локальной взаимопомощи."
          />
          <ValueCard
            icon={Scale}
            title="Прозрачность"
            text="Модерация, жалобы и понятные роли делают площадку аккуратнее и безопаснее."
          />
        </div>

        <section className="mt-8 rounded-[28px] bg-white p-8 shadow-card">
          <h2 className="text-2xl font-black">Что уже умеет платформа</h2>
          <div className="mt-5 grid gap-3 text-ink/70 md:grid-cols-2">
            <p className="rounded-xl bg-[#fffdf9] p-4">Каталог с фильтрами по категориям, типу объявления, городу и поиску.</p>
            <p className="rounded-xl bg-[#fffdf9] p-4">Личный кабинет с объявлениями, откликами, сообщениями и управлением профилем.</p>
            <p className="rounded-xl bg-[#fffdf9] p-4">Чаты между пользователями для согласования передачи вещей.</p>
            <p className="rounded-xl bg-[#fffdf9] p-4">Роли пользователя, модератора и администратора с разным доступом к ресурсам.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function ValueCard({ icon: Icon, title, text }: { icon: typeof HeartHandshake; title: string; text: string }) {
  return (
    <article className="rounded-[24px] bg-white p-6 shadow-card">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-leaf-50 text-leaf-700">
        <Icon size={28} />
      </div>
      <h2 className="mt-5 text-xl font-extrabold">{title}</h2>
      <p className="mt-3 leading-7 text-ink/65">{text}</p>
    </article>
  );
}
