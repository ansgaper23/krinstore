import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-[#FF9DB8] flex items-center justify-center text-white font-display font-bold">K</div>
      <span className="font-display text-xl font-semibold text-ink">KrinStore</span>
    </Link>
  );
}
