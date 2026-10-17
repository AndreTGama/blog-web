"use client";


export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <article className="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-slate-900">
      {children}
    </article>
  );
}
