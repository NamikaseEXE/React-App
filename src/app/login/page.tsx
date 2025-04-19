"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/InputField";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.email.trim()) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      newErrors.email = "Correo inválido.";
    }
    if (!form.password) newErrors.password = "La contraseña es obligatoria.";
    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setSuccess(false);
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem("token", data.token);
          setSuccess(true);
          setForm({ email: "", password: "" });
          router.push("/");
        } else {
          setServerError(data.error || "Error al iniciar sesión.");
        }
      } catch (err) {
        setServerError("No se pudo conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-md bg-[#181818] rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-[var(--foreground)]">
          Iniciar sesión
        </h1>
        {success && (
          <div className="text-green-500 text-center mb-4">
            ¡Bienvenido de nuevo!
          </div>
        )}
        {serverError && (
          <div className="text-red-500 text-center mb-4">{serverError}</div>
        )}
        <form onSubmit={handleFormSubmit} noValidate>
          <InputField
            label="Correo electrónico"
            name="email"
            type="email"
            value={form.email}
            onChange={handleInputChange}
            error={errors.email}
          />
          <InputField
            label="Contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={handleInputChange}
            error={errors.password}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
          <p className="text-center text-sm text-[var(--foreground)] mt-4">
            ¿No tienes cuenta?{' '}
            <a href="/register" className="text-blue-400 hover:underline">Regístrate</a>
          </p>
        </form>
      </div>
    </div>
  );
}