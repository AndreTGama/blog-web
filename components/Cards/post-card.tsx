"use client";

import Image from "next/image";
import Link from "next/link";

import { PostCardProps } from "@/types/Post";

import { formatDate } from "@/lib/utils/format";

export default function PostCard({
  post,
  selectedCategories,
  onToggleCategory,
}: PostCardProps) {
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.025] transition-colors hover:bg-foreground/[0.05]">
      <Link
        href={`/artigos/${encodeURIComponent(post.id)}`}
        className="text-sm font-medium text-foreground/75 transition-colors hover:text-foreground"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-foreground/[0.07]">
          {post.cover_image ? (
            <Image
              src={post.cover_image}
              alt=""
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-3xl text-foreground/25">
              {"</>"}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap gap-2">
            {post.categories?.map((category) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={selectedCategories.includes(category.id)}
                onClick={() => onToggleCategory(category.id)}
                className="rounded-full border border-foreground/10 px-2.5 py-1 text-xs text-foreground/65 transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {category.name}
              </button>
            ))}
          </div>
          <h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight">
            <Link
              href={`/artigos/${encodeURIComponent(post.id)}`}
              className="transition-colors hover:text-foreground/70 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            >
              {post.title}
            </Link>
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-foreground/65">
            {post.excerpt}
          </p>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-foreground/10 pt-4 text-xs text-foreground/50">
            <span>
              {formatDate(post.published_at)} · {post.views} visualizações
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
