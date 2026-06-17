import { Paperclip, Phone, Search, Send } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  getErrorMessage,
  getMessages,
  markMessageRead,
  sendMessage,
  type Message,
  type MessageThread,
} from "../api/api";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

function getThreadData(message: Message, currentUserId?: number) {
  const senderIsCurrentUser = message.sender_id === currentUserId;
  const counterpartId = senderIsCurrentUser ? message.receiver : message.sender_id;
  const counterpartName = senderIsCurrentUser ? message.receiver_name : message.sender;
  return {
    key: `${message.ad}-${counterpartId}`,
    counterpartId,
    counterpartName,
  };
}

export function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedThreadKey, setSelectedThreadKey] = useState("");
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getMessages()
      .then((items) => {
        setMessages(items);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const threads = useMemo<MessageThread[]>(() => {
    const byKey = new Map<string, MessageThread>();

    messages.forEach((message) => {
      const { key, counterpartId, counterpartName } = getThreadData(message, user?.id);
      const existing = byKey.get(key);
      const unreadCount = !message.is_read && message.sender_id !== user?.id ? 1 : 0;

      if (!existing) {
        byKey.set(key, {
          key,
          ad: message.ad,
          adTitle: message.ad_title,
          counterpartId,
          counterpartName,
          lastMessage: message,
          unreadCount,
        });
        return;
      }

      byKey.set(key, {
        ...existing,
        lastMessage:
          new Date(message.created_at).getTime() > new Date(existing.lastMessage.created_at).getTime()
            ? message
            : existing.lastMessage,
        unreadCount: existing.unreadCount + unreadCount,
      });
    });

    return [...byKey.values()].sort(
      (left, right) =>
        new Date(right.lastMessage.created_at).getTime() -
        new Date(left.lastMessage.created_at).getTime(),
    );
  }, [messages, user?.id]);

  useEffect(() => {
    if (!threads.length) {
      setSelectedThreadKey("");
      return;
    }

    setSelectedThreadKey((current) => {
      if (current && threads.some((thread) => thread.key === current)) {
        return current;
      }
      return threads[0].key;
    });
  }, [threads]);

  const filteredThreads = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return threads;
    }

    return threads.filter((thread) =>
      [thread.counterpartName, thread.adTitle, thread.lastMessage.text]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [search, threads]);

  const selectedThread = filteredThreads.find((thread) => thread.key === selectedThreadKey)
    || threads.find((thread) => thread.key === selectedThreadKey)
    || null;

  const selectedMessages = useMemo(() => {
    if (!selectedThread) return [];
    return messages
      .filter((message) => getThreadData(message, user?.id).key === selectedThread.key)
      .sort(
        (left, right) =>
          new Date(left.created_at).getTime() - new Date(right.created_at).getTime(),
      );
  }, [messages, selectedThread, user?.id]);

  useEffect(() => {
    if (!selectedThread || !user) return;

    const unread = selectedMessages.filter(
      (message) => !message.is_read && message.sender_id !== user.id,
    );
    if (!unread.length) return;

    void Promise.all(unread.map((message) => markMessageRead(message.id)))
      .then((updatedMessages) => {
        const byId = new Map(updatedMessages.map((message) => [message.id, message]));
        setMessages((current) =>
          current.map((message) => byId.get(message.id) || message),
        );
      })
      .catch(() => undefined);
  }, [selectedMessages, selectedThread, user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedThread || !text.trim()) return;
    setError("");
    setSending(true);
    try {
      const sent = await sendMessage({
        receiver: selectedThread.counterpartId,
        ad: selectedThread.ad,
        text: text.trim(),
      });
      setMessages((items) => [sent, ...items]);
      setText("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="flex min-h-screen flex-1 flex-col bg-white md:flex-row">
        <section className="w-full border-b border-black/10 p-6 md:max-w-sm md:border-b-0 md:border-r">
          <h1 className="text-2xl font-black">Сообщения</h1>
          <label className="input-wrap mt-6 bg-white">
            <Search size={18} />
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск по чатам"
              value={search}
            />
          </label>
          {error && <p className="notice notice-error mt-4">{error}</p>}
          <div className="mt-5 space-y-2">
            {filteredThreads.map((item) => (
              <button
                key={item.key}
                className={`flex w-full items-center gap-3 rounded-lg p-3 text-left ${selectedThread?.key === item.key ? "bg-leaf-50" : "hover:bg-cream"}`}
                onClick={() => setSelectedThreadKey(item.key)}
                type="button"
              >
                <div className="grid h-12 w-12 place-items-center rounded-full bg-leaf-100 text-sm font-black text-leaf-800">
                  {item.counterpartName.slice(0, 1).toUpperCase()}
                </div>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm">{item.counterpartName}</strong>
                  <span className="block truncate text-xs font-semibold text-leaf-700">{item.adTitle}</span>
                  <span className="block truncate text-sm text-ink/55">{item.lastMessage.text}</span>
                </span>
                {item.unreadCount > 0 && (
                  <span className="rounded-full bg-leaf-600 px-2 py-0.5 text-xs text-white">
                    {item.unreadCount}
                  </span>
                )}
              </button>
            ))}
            {!filteredThreads.length && (
              <p className="rounded-lg bg-[#fffdf9] p-4 text-sm font-semibold text-ink/55">
                Чаты пока не найдены.
              </p>
            )}
          </div>
        </section>

        <section className="flex flex-1 flex-col">
          <header className="flex min-h-20 items-center justify-between border-b border-black/10 px-6 md:px-8">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-leaf-100 text-sm font-black text-leaf-800">
                {selectedThread?.counterpartName.slice(0, 1).toUpperCase() || "?"}
              </div>
              <div>
                <h2 className="font-extrabold">{selectedThread?.counterpartName || "Выберите чат"}</h2>
                <p className="text-sm font-semibold text-leaf-700">{selectedThread?.adTitle || "История переписки"}</p>
              </div>
            </div>
            <Phone className="text-leaf-800" />
          </header>

          <div className="flex-1 space-y-5 bg-[#fffdf9] p-6 md:p-8">
            {selectedMessages.map((message) => (
              <MessageBubble
                align={message.sender_id === user?.id ? "right" : "left"}
                key={message.id}
                text={message.text}
                time={new Date(message.created_at).toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
            ))}
            {!selectedMessages.length && (
              <div className="grid h-full min-h-56 place-items-center">
                <p className="text-sm font-semibold text-ink/55">
                  Выберите чат слева, чтобы посмотреть переписку.
                </p>
              </div>
            )}
          </div>

          <form className="flex items-center gap-3 border-t border-black/10 p-5" onSubmit={submit}>
            <button className="icon-btn" type="button">
              <Paperclip size={20} />
            </button>
            <label className="field flex-1">
              <input
                className="w-full bg-transparent outline-none"
                disabled={!selectedThread || sending}
                onChange={(event) => setText(event.target.value)}
                placeholder={selectedThread ? "Напишите сообщение..." : "Сначала выберите чат"}
                value={text}
              />
            </label>
            <button
              className="grid h-12 w-12 place-items-center rounded-full bg-leaf-600 text-white disabled:cursor-not-allowed disabled:bg-leaf-300"
              disabled={!selectedThread || !text.trim() || sending}
              type="submit"
            >
              <Send size={20} />
            </button>
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
