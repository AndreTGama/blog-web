export default function HeaderMain() {
  return (
    <header
      className="h-screen overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url('/img/background.png')",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 py-50">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.85)]">
          Engenharia de software, sem atalhos
        </p>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.85)] sm:text-6xl">
          Ideias, padrões e código para construir melhor.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.85)] sm:text-lg">
          Conteúdos sobre arquitetura, padrões de projeto e desenvolvimento, com
          exemplos práticos para levar da leitura ao código.
        </p>
        <a
          href="#conteudos"
          className="mt-8 inline-flex rounded-full bg-[#181818] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
        >
          Explorar conteúdos
        </a>
      </div>
    </header>
  );
}
