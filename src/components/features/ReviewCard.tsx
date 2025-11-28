"use client";

import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, User } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { tmdbClient } from "@/lib/tmdb/client";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { Database } from "@/types/supabase";
import type { TMDBTVDetail } from "@/types/tmdb";

type Review = Database["public"]["Tables"]["reviews"]["Row"] & {
  user_profiles: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

interface ReviewCardProps {
  review: Review;
  anime?: TMDBTVDetail | null;
  locale?: string;
}

export function ReviewCard({ review, anime, locale = "ko" }: ReviewCardProps) {
  const t = useTranslations("review");
  const displayName =
    review.user_profiles?.display_name ||
    review.user_profiles?.username ||
    "익명";

  const posterUrl = anime
    ? tmdbClient.getPosterURL(anime.poster_path)
    : null;

  return (
    <Card className="group transition-all duration-200 hover:bg-zinc-800">
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* 애니메이션 포스터 */}
          {posterUrl && anime ? (
            <Link
              href={ROUTES.ANIME.DETAIL(anime.id)}
              className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-lg transition-transform duration-200 group-hover:scale-105"
            >
              <Image
                src={posterUrl}
                alt={anime.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </Link>
          ) : (
            <div className="h-32 w-24 flex-shrink-0 rounded-lg bg-zinc-800" />
          )}

          {/* 리뷰 내용 */}
          <div className="flex-1 space-y-3">
            {/* 헤더 */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {anime ? (
                  <Link
                    href={ROUTES.ANIME.DETAIL(anime.id)}
                    className="text-xl font-semibold text-white transition-colors hover:text-blue-500"
                  >
                    {anime.name}
                  </Link>
                ) : (
                  <div className="h-6 w-32 animate-pulse rounded bg-zinc-800" />
                )}
                {review.title && (
                  <h3 className="mt-1 text-lg font-medium text-zinc-300">
                    {review.title}
                  </h3>
                )}
              </div>
              <Badge variant="rating" className="gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {review.rating}/10
              </Badge>
            </div>

            {/* 리뷰 내용 */}
            <p className="line-clamp-2 text-zinc-400">{review.content}</p>

            {/* 작성자 정보 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {review.user_profiles?.avatar_url ? (
                  <Image
                    src={review.user_profiles.avatar_url}
                    alt={displayName}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-white">{displayName}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(review.created_at).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <Link
                href={ROUTES.REVIEWS.DETAIL(review.id)}
                className="text-sm text-blue-500 transition-colors hover:text-blue-400"
              >
                {t("read_more")} →
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

