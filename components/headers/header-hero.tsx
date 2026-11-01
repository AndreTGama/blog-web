import { HeaderHeroProps } from "@/types/Headers";

export default function HeaderHero({
  eyebrow,
  title,
  description,
  backgroundImage,
  headerClassName,
  contentClassName,
  action,
}: HeaderHeroProps) {
  return (
    <header
      className={headerClassName}
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url('${backgroundImage}')`,
      }}
    >
      <div className={contentClassName}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.85)]">
          {eyebrow}
        </p>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.85)] sm:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.85)] sm:text-lg">
          {description}
        </p>
        {action && (
          <a
            href={action.href}
            className="mt-8 inline-flex rounded-full bg-[#181818] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
          >
            {action.label}
          </a>
        )}
      </div>
    </header>
  );
}
