import { Paperclip, Phone, Search, Send } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getErrorMessage, getMessages, sendMessage, type Message } from "../api/api";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { conversations } from "../data/demo";

export function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getMessages().then((items) => {
      setMessages(items);
      setSelected(items[0] || null);
    }).catch((err) => setError(getErrorMessage(err)));
  }, []);

  const threads = useMemo(() => {
    const byKey = new Map<string, Message>();
    messages.forEach((message) => {
      const key = `${message.ad}-${message.receiver_name || message.sender}`;
      if (!byKey.has(key)) byKey.set(key, message);
    });
    return [...byKey.values()];
  }, [messages]);

  const selectedMessages = selected
    ? messages.filter((message) => message.ad === selected.ad && (message.receiver === selected.receiver || message.sender === selected.sender))
    : [];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !text.trim() || !user) return;
    const receiver = selected.sender_id === user.id ? selected.receiver : selected.sender_id;
    try {
      const sent = await sendMessage({ receiver, ad: selected.ad, text });
      setMessages((items) => [...items, sent]);
      setText("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const visibleThreads = threads.length ? threads : [];

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="flex min-h-screen flex-1 bg-white">
        <section className="w-full max-w-sm border-r border-black/10 p-6">
          <h1 className="text-2xl font-black">Сообщения</h1>
          <label className="input-wrap mt-6 bg-white"><Search size={18} /><input placeholder="Поиск" /></label>
          {error && <p className="notice notice-error mt-4">{error}</p>}
          <div className="mt-5 space-y-2">
            {visibleThreads.map((item) => (
              <button key={item.id} className={`flex w-full items-center gap-3 rounded-lg p-3 text-left ${selected?.id === item.id ? "bg-leaf-50" : "hover:bg-cream"}`} onClick={() => setSelected(item)} type="button">
                <img src={conversations[0].avatar} alt={item.receiver_name || item.sender} className="h-12 w-12 rounded-full object-cover" />
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm">{item.receiver_name || item.sender}</strong>
                  <span className="block truncate text-sm text-ink/55">{item.text}</span>
                </span>
                {!item.is_read && <span className="rounded-full bg-leaf-600 px-2 py-0.5 text-xs text-white">new</span>}
              </button>
            ))}
            {!visibleThreads.length && conversations.map((item, index) => (
              <button key={item.name} className={`flex w-full items-center gap-3 rounded-lg p-3 text-left ${index === 0 ? "bg-leaf-50" : "hover:bg-cream"}`} type="button">
                <img src={item.avatar} alt={item.name} className="h-12 w-12 rounded-full object-cover" />
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm">{item.name}</strong>
                  <span className="block truncate text-sm text-ink/55">{item.text}</span>
                </span>
                <span className="text-xs text-ink/45">{item.time}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="hidden flex-1 flex-col md:flex">
          <header className="flex h-20 items-center justify-between border-b border-black/10 px-8">
            <div className="flex items-center gap-3">
              <img src={conversations[0].avatar} alt="Собеседник" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <h2 className="font-extrabold">{selected?.receiver_name || selected?.sender || "Мария П."}</h2>
                <p className="text-sm font-semibold text-leaf-700">{selected?.ad_title || "В сети"}</p>
              </div>
            </div>
            <Phone className="text-leaf-800" />
          </header>
          <div className="flex-1 space-y-5 bg-[#fffdf9] p-8">
            {(selectedMessages.length ? selectedMessages : []).map((message) => (
              <MessageBubble align={message.sender_id === user?.id ? "right" : "left"} text={message.text} time={new Date(message.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })} key={message.id} />
            ))}
            {!selectedMessages.length && (
              <>
                <MessageBubble align="left" text="Здравствуйте! Я хотела бы узнать подробнее о вещи 🙂" time="14:20" />
                <MessageBubble align="right" text="Добрый день! Да, конечно. Вещь в хорошем состоянии." time="14:21" />
              </>
            )}
          </div>
          <form className="flex items-center gap-3 border-t border-black/10 p-5" onSubmit={submit}>
            <button className="icon-btn" type="button"><Paperclip size={20} /></button>
            <label className="field flex-1"><input className="w-full bg-transparent outline-none" value={text} onChange={(event) => setText(event.target.value)} placeholder="Напишите сообщение..." /></label>
            <button className="grid h-12 w-12 place-items-center rounded-full bg-leaf-600 text-white" type="submit"><Send size={20} /></button>
          </form>
        </section>
      </main>
    </div>
  );
}

function MessageBubble({ align, text, time }: { align: "left" | "right"; text: string; time: string }) {
  return (
    <div className={`flex ${align === "right" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-md rounded-lg px-5 py-4 shadow-sm ${align === "right" ? "bg-leaf-100" : "bg-white"}`}>
        <p className="leading-6">{text}</p>
        <p className="mt-1 text-right text-xs text-ink/45">{time}</p>
      </div>
    </div>
  );
}
