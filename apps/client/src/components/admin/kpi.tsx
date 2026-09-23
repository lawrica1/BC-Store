interface KpiProps {
  label: string;
  value: string;
  accent: "cyan" | "orange";
}

export function Kpi({ label, value, accent }: KpiProps) {
  return (
    <article className={`glass-card rounded-2xl p-4 ${accent === "cyan" ? "shadow-cyanGlow" : "shadow-orangeGlow"}`}>
      <p className="text-xs text-textMuted">{label}</p>
      <strong className={`mt-1 block text-2xl font-black sm:text-3xl ${accent === "cyan" ? "text-buyCyan" : "text-serviceOrange"}`}>{value}</strong>
    </article>
  );
}
