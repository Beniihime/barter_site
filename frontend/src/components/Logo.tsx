import { HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-extrabold text-ink">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-leaf-50 text-leaf-700 ring-1 ring-leaf-200">
        <HeartHandshake size={26} strokeWidth={2.6} />
      </span>
      <span className="hidden sm:inline">ДоброРядом</span>
    </Link>
  );
}
