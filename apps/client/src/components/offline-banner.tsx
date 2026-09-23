"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";

export function OfflineBanner() {
  const { dictionary } = useLanguage();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="sticky top-0 z-[60] bg-serviceOrange px-4 py-2 text-center text-sm font-bold text-void">
      {dictionary.offline.message}
    </div>
  );
}
