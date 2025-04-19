"use client";

import React, { useState } from "react";

export default function RegisterPage() {
  // Estado del formulario
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Estado para errores de validación
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Estado para saber si el formulario fue enviado con éxito
  const [submitted, setSubmitted] = useState(false);
  // Estado para mensajes de error del servidor
  const [serverError, setServerError] = useState("");
  // Estado de carga
  const [loading, setLoading] = useState(false);

  // Función para validar los datos del formulario
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.name.trim()) newErrors.name = "Por favor, ingresa tu nombre.";
    if (!form.email.trim()) {
      newErrors.email = "Necesitamos tu correo electrónico.";
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      newErrors.email = "Ese correo no parece válido.";
    }

    if (!form.password) newErrors.password = "Ingresa una contraseña segura.";
    if (!form.confirmPassword)
      newErrors.confirmPassword = "Confirma tu contraseña.";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Ups... las contraseñas no coinciden.";

    return newErrors;
  };

  // Manejador para los cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Manejador para el envío del formulario
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      setSubmitted(false);
      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form }),
        });
        const data = await response.json();
        if (response.ok) {
          console.log(data);
          setSubmitted(true);
          setForm({ name: "", email: "", password: "", confirmPassword: "" });
        } else {
          setServerError(data.error || "Ocurrió un error inesperado.");
        }
      } catch (err) {
        setServerError("No se pudo conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    } else {
      setSubmitted(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-md bg-[#181818] rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-[var(--foreground)]">
          ¡Crea tu cuenta!
        </h1>

        {submitted && (
          <div className="text-green-500 text-center mb-4">
            🎉 ¡Registro completado con éxito!
          </div>
        )}
        {serverError && (
          <div className="text-red-500 text-center mb-4">
            {serverError}
          </div>
        )}
        <form onSubmit={handleFormSubmit} noValidate>
          {/* Campo: Nombre */}
          <InputField
            label="Nombre"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            error={errors.name}
          />

          {/* Campo: Correo */}
          <InputField
            label="Correo electrónico"
            name="email"
            type="email"
            value={form.email}
            onChange={handleInputChange}
            error={errors.email}
          />

          {/* Campo: Contraseña */}
          <InputField
            label="Contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={handleInputChange}
            error={errors.password}
          />

          {/* Campo: Confirmar contraseña */}
          <InputField
            label="Confirmar contraseña"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Componente reutilizable para campos de input
function InputField({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
}) {
  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-[var(--foreground)] mb-1 font-medium"
      >
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 rounded border focus:outline-none bg-[#232323] text-[var(--foreground)] ${
          error ? "border-red-500" : "border-gray-600"
        }`}
        autoComplete="off"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
