export default function HeaderMain() {
  return (
    <header
      className="relative isolate overflow-hidden border-b border-foreground/10"
      style={{ background: `linear-gradient(
          rgba(0, 0, 0, 0.5), 
          rgba(0, 0, 0, 0.5)),
          url('/img/background.png')
      `}}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center"
        
      />
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/55">
          Engenharia de software, sem atalhos
        </p>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Ideias, padrões e código para construir melhor.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-foreground/65 sm:text-lg">
          Conteúdos sobre arquitetura, padrões de projeto e desenvolvimento, com
          exemplos práticos para levar da leitura ao código.
        </p>
        <a
          href="#conteudos"
          className="mt-8 inline-flex rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-80"
        >
          Explorar conteúdos
        </a>
      </div>
    </header>
  );
}
