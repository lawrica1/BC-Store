import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "BC Store",
  description: "BC Store - boutique, réparation et installation technique.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/pwa-192.svg", type: "image/svg+xml" }
    ]
  }
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var saved = localStorage.getItem("bc-store-theme");
    var theme =
      saved === "light" || saved === "dark"
        ? saved
        : window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark";
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme is set by the inline script below before hydration, based on localStorage/system
    // preference the server can't see — a mismatch here is expected and intentional, not a bug.
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#080C14" />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
