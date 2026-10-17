"use client";

import { InputProps } from "@/types/Input";

export default function Input({
  label,
  type,
  id,
  name,
  placeholder,
  value,
  onChange,
}: InputProps) {
  return (
    <>
      <label
        htmlFor={id}
        className="mb-2 block font-bold text-foreground"
      >
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground placeholder:text-foreground/50 focus:border-foreground focus:outline-none"
      />
    </>
  );
}
