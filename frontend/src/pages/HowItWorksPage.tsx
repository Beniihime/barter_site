import { CheckCheck, MessageCircleMore, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "../components/Header";

const steps = [
  {
    icon: Search,
    title: "1. Найдите или разместите объявление",
    text: "Вы можете быстро отфильтровать каталог по категории, городу и типу передачи либо сразу создать собственное объявление.",
  },
  {
    icon: MessageCircleMore,
    title: "2. Свяжитесь напрямую",
    text: "Откликайтесь на вещи, пишите автору в чат и договаривайтесь о деталях передачи без лишних посредников.",
  },
  {
    icon: ShieldCheck,
    title: "3. Модерация следит за качеством",
    text: "Новые объявления проходят проверку, а жалобы помогают быстро убрать неактуальные или сомнительные публикации.",
  },
  {
    icon: CheckCheck,
    title: "4. Передайте вещь тому, кому она нужна",
    text: "Когда договорились, встречаетесь и завершаете обмен или безвозмездную передачу с пользой для другой семьи.",
  },
];

export function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <Header />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <section className="rounded-[28px] border border-leaf-100 bg-white p-8 shadow-card">
          <h1 className="text-4xl font-black text-ink">Как это работает</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/65">
            ДоброРядом помогает людям безопасно передавать нужные вещи тем, кому они действительно пригодятся. Ниже весь путь пользователя от первого клика до передачи вещи.
          </p>
        </section>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {steps.map(({ icon: Icon, title, text }) => (
            <article className="rounded-[24px] bg-white p-6 shadow-card" key={title}>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-leaf-50 text-leaf-700">
                <Icon size={28} />
              </div>
              <h2 className="mt-5 text-xl font-extrabold">{title}</h2>
              <p className="mt-3 leading-7 text-ink/65">{text}</p>
            </article>
          ))}
        </div>

        <section className="mt-8 rounded-[28px] bg-leaf-700 p-8 text-white shadow-card">
          <h2 className="text-2xl font-black">Готовы начать?</h2>
          <p className="mt-3 max-w-2xl text-white/85">
            Если у вас есть вещи, которые могут помочь другим, разместите объявление. Если вы ищете что-то нужное для семьи, откройте каталог и начните диалог.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="btn bg-white px-5 text-leaf-800 hover:bg-cream" to="/create-ad">Разместить объявление</Link>
            <Link className="btn border border-white/25 px-5 text-white hover:bg-white/10" to="/catalog">Открыть каталог</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
