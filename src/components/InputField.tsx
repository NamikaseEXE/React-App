"use client";
import React from "react";

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
}

export default function InputField({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
}: InputFieldProps) {
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
