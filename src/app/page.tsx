"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  function getUserNameFromToken(token: string | null): string | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.name || 'Invitado';
    } catch {
      return 'Invitado';
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
  const formas = ['circulo', 'cuadrado', 'triángulo', 'rectángulo', 'óvalo', 'equilates']
  function cambiaFormas() {
    if (value < formas.length - 1) {
      setValue(value + 1)
    } else {
      setValue(0)
    }
  }
  return (
    <>
      <NavBar />
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center 
      min-h-screen p-8 pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
        <div className="text-3xl text-[var(--foreground)">Bienvenido -&gt;
          <div className="font-bold inline bg-amber-50 rounded-2xl p-1 ms-1 text-black"> {userName}</div>
        </div>
        <div className="text-4xl">Ahora es un: {formas[value]}:
          <Button onClick={cambiaFormas}>Click aquí</Button>
        </div>
        <div className="flex justify-center text-4xl">
          <Button onClick={() => { setValue(0) }}>Resetear Contador</Button>
        </div>
      </div>
    </>
  );
}
