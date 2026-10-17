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
      <label htmlFor={id} className="block font-bold text-gray-900 mb-2">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
      />
    </>
  );
}
