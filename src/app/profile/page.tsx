"use client";
import React, { useEffect, useState } from "react";
import InputField from "@/components/InputField";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Decodifica el JWT para obtener el id/email
  function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  function getUserFromToken(token: string | null): { id: string; email: string } | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return { id: payload.id, email: payload.email };
    } catch {
      return null;
    }
  }

  useEffect(() => {
    const token = getToken();
    const user = getUserFromToken(token);
    if (!token || !user) {
      router.push("/login");
      return;
    }

    // Obtener perfil actual del usuario
    fetch("/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data.user);
        setForm({ name: data.user.name, email: data.user.email, password: "" });
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudo cargar el perfil.");
        setLoading(false);
      });
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    const token = getToken();
    if (form.password && form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setSaving(false);
      return;
    }
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setForm((prev) => ({ ...prev, password: "" }));
        setSuccess(true);
      } else {
        setError(data.error || "No se pudo actualizar el perfil.");
      }
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Cargando perfil...</div>;
  }

  return (
    <>
      <NavBar />
      <div className="max-w-lg mx-auto mt-12 bg-[#181818] rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-[var(--foreground)]">Mi Perfil</h1>
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
        {success && <div className="text-green-600 mb-4 text-center">¡Perfil actualizado!</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Nombre"
            name="name"
            value={form.name}
            onChange={handleInputChange}
          />
          <InputField
            label="Correo electrónico"
            name="email"
            type="email"
            value={form.email}
            onChange={handleInputChange}
          />
          <div className="relative">
            <InputField
              label="Nueva contraseña"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleInputChange}
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-sm text-gray-600 hover:text-gray-900"
              onClick={() => setShowPassword((show) => !show)}
              tabIndex={-1}
            >
              {showPassword ? "Ocultar" : "Ver"}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </>
  );
}
