"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  function getUserNameFromToken(token: string | null): string | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.name || null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      } else {
        setUserName(getUserNameFromToken(token));
        setLoading(false);
      }
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-lg text-[var(--foreground)]">Cargando...</span>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <div className="text-3xl text-[var(--foreground)">Bienvenido -&gt;
          <div className="font-bold inline bg-amber-50 rounded-2xl p-1 ms-1 text-black"> {userName ? userName : "Invitado"}</div>
        </div>
      </div>
    </>
  );
}
