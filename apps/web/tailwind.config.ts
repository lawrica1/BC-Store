import type { Config } from "tailwindcss";

function withOpacity(variable: string) {
  return `rgb(var(${variable}) / <alpha-value>)`;
}

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: withOpacity("--void"),
        slatePanel: withOpacity("--slate-panel"),
        borderTech: withOpacity("--border-tech"),
        textMain: withOpacity("--text-main"),
        textMuted: withOpacity("--text-muted"),
        buyCyan: withOpacity("--buy-cyan"),
        buyBlue: withOpacity("--buy-blue"),
        serviceOrange: withOpacity("--service-orange"),
        successEmerald: withOpacity("--success-emerald")
      },
      boxShadow: {
        cyanGlow: "0 0 30px rgb(var(--buy-cyan) / var(--glow-buy-opacity))",
        orangeGlow: "0 0 30px rgb(var(--service-orange) / var(--glow-service-opacity))"
      },
      fontFamily: {
        sans: ["Inter", "Geist", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
