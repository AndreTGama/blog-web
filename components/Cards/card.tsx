"use client";


export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <article className="mx-auto w-full max-w-md rounded-lg border border-foreground/10 bg-foreground/[0.04] p-6 shadow-md">
      {children}
    </article>
  );
}
