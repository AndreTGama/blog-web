"use client";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/components/ui/theme-toggle";

export default function Navbar() {
  return (
    <nav
      aria-label="Navegação principal"
      className="border-b border-foreground/10 bg-background fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          aria-label="Blog de tecnologia - início"
          className="inline-flex items-center gap-3"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-foreground text-sm font-bold text-background">
            <Image
              src="/img/logo.png"
              alt="Logo do blog de tecnologia"
              width={40}
              height={40}
              className="rounded-xl"
            />
          </span>
          <span className="font-semibold tracking-tight">
            Blog de tecnologia
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <a
            href="#conteudos"
            className="hidden text-sm text-foreground/70 transition-colors hover:text-foreground sm:inline"
          >
            Conteúdos
          </a>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
