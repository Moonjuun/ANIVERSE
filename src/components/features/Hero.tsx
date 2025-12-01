"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/features/FavoriteButton";
import { tmdbClient } from "@/lib/tmdb/client";
import { ROUTES } from "@/constants/routes";
import type { TMDBTVShow } from "@/types/tmdb";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";

interface HeroProps {
  anime: TMDBTVShow;
  locale: string;
}

export function Hero({ anime, locale }: HeroProps) {
  const t = useTranslations("home.hero");
  const backdropUrl = tmdbClient.getBackdropURL(anime.backdrop_path);
  const rating = anime.vote_average.toFixed(1);
  
  // 줄거리 2줄 제한 (대략 150자)
  const overview = anime.overview
    ? anime.overview.length > 150
      ? `${anime.overview.slice(0, 150)}...`
      : anime.overview
    : "";

  return (
    <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
      {/* 배경 이미지 */}
      <div className="absolute inset-0">
        <Image
          src={backdropUrl || "/images/placeholder-poster.svg"}
          alt={anime.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={90}
        />
      </div>

      {/* Overlay 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />

      {/* 콘텐츠 */}
      <div className="relative z-10 flex h-full items-end">
        <div className="w-full px-4 pb-12 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl space-y-4">
              {/* 제목 */}
              <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
                {anime.name}
              </h1>

              {/* 평점 */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold text-white">
                    {rating}
                  </span>
                </div>
                <span className="text-sm text-zinc-400">
                  ({anime.vote_count.toLocaleString()} {t("votes")})
                </span>
              </div>

              {/* 줄거리 */}
              {overview && (
                <p className="line-clamp-2 text-base leading-relaxed text-zinc-300 md:text-lg">
                  {overview}
                </p>
              )}

              {/* 버튼 그룹 */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link href={ROUTES.ANIME.DETAIL(anime.id)}>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-500">
                    {t("view_details")}
                  </Button>
                </Link>
                <FavoriteButton animeId={anime.id} size="lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

