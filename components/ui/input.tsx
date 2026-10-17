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
        className="mb-2 block font-bold text-gray-900 dark:text-slate-100"
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
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
      />
    </>
  );
}
