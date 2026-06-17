import { Heart, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import type { Ad } from "../api/api";

type Props = {
  ad: Ad & { image?: string; owner?: string };
  onRespond?: (ad: Ad) => void;
  onComplain?: (ad: Ad) => void;
  onMessage?: (ad: Ad) => void;
};

export function AdCard({ ad, onRespond, onComplain, onMessage }: Props) {
  const image = ad.image || ad.images?.[0]?.image || "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=800&q=80";

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      className="overflow-hidden rounded-lg border border-black/5 bg-white shadow-card"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-leaf-50">
        <img className="h-full w-full object-cover" src={image} alt={ad.title} />
        <button className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm">
          <Heart size={18} />
        </button>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-ink">{ad.title}</h3>
            <p className="text-sm text-ink/55">{ad.category_detail?.name || "Категория"}</p>
          </div>
          <span className="rounded-full bg-leaf-50 px-2.5 py-1 text-xs font-bold text-leaf-700">
            {ad.ad_type === "free" ? "Бесплатно" : "Обмен"}
          </span>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-ink/64">{ad.description}</p>
        <div className="flex items-center gap-1 text-sm font-medium text-ink/55">
          <MapPin size={15} />
          г. {ad.city}
        </div>
        {(onRespond || onComplain || onMessage) && (
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button className="mini-action" type="button" onClick={() => onRespond?.(ad)}>Отклик</button>
            <button className="mini-action" type="button" onClick={() => onMessage?.(ad)}>Чат</button>
            <button className="mini-action" type="button" onClick={() => onComplain?.(ad)}>Жалоба</button>
          </div>
        )}
      </div>
    </motion.article>
  );
}
