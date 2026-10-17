"use client";


export default function Card({ children }: { children: React.ReactNode }) {
  
  return (
    <article className="bg-white shadow-md rounded-lg p-6 w-full max-w-md mx-auto">
        {children}
    </article>
  );
}
