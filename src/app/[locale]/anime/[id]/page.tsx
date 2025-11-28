import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { tmdbClient } from "@/lib/tmdb/client";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Tv, Users } from "lucide-react";
import { ReviewSection } from "@/components/features/ReviewSection";
import { AnimeActions } from "@/components/features/AnimeActions";
import type { TMDBTVDetail } from "@/types/tmdb";

export async function generateStaticParams() {
  // 동적 생성이므로 빈 배열 반환 (ISR 사용)
  return [];
}

interface AnimeDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function AnimeDetailPage({
  params,
}: AnimeDetailPageProps) {
  const { locale, id } = await params;
  const t = await getTranslations("anime.detail");

  // 언어 매핑
  const languageMap: Record<string, string> = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
  };
  const language = languageMap[locale] || "ko-KR";

  // 애니메이션 상세 정보 가져오기
  let anime: TMDBTVDetail;
  try {
    anime = await tmdbClient.getTVDetail(Number(id), language);
  } catch (error) {
    console.error("TMDB API Error:", error);
    notFound();
  }

  const posterUrl = tmdbClient.getPosterURL(anime.poster_path);
  const backdropUrl = tmdbClient.getBackdropURL(anime.backdrop_path);
  const rating = anime.vote_average.toFixed(1);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Backdrop */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        {backdropUrl && (
          <div className="absolute inset-0">
            <Image
              src={backdropUrl}
              alt={anime.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/80 to-zinc-950" />
          </div>
        )}

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-12 md:px-6 lg:px-8">
          <div className="flex w-full flex-col gap-6 md:flex-row md:items-end">
            {/* Poster */}
            <div className="relative h-[400px] w-[266px] flex-shrink-0 overflow-hidden rounded-xl shadow-2xl">
              <Image
                src={posterUrl}
                alt={anime.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4 pb-4">
              <div>
                <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                  {anime.name}
                </h1>
                {anime.original_name !== anime.name && (
                  <p className="mt-2 text-xl text-zinc-400">
                    {anime.original_name}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Badge variant="rating" className="gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {rating}
                </Badge>
                {anime.first_air_date && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(anime.first_air_date).getFullYear()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-zinc-400">
                  <Tv className="h-4 w-4" />
                  <span>
                    {anime.number_of_seasons} {t("seasons")} ·{" "}
                    {anime.number_of_episodes} {t("episodes")}
                  </span>
                </div>
                {anime.vote_count > 0 && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Users className="h-4 w-4" />
                    <span>
                      {anime.vote_count.toLocaleString()} {t("ratings")}
                    </span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {anime.genres && anime.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre) => (
                    <Badge key={genre.id} variant="default">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <AnimeActions animeId={Number(id)} />
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            {anime.overview && (
              <div>
                <h2 className="mb-4 text-2xl font-semibold text-white">
                  {t("overview")}
                </h2>
                <p className="text-lg leading-relaxed text-zinc-400">
                  {anime.overview}
                </p>
              </div>
            )}

            {/* Tagline */}
            {anime.tagline && (
              <div className="rounded-xl bg-zinc-900 p-6">
                <p className="text-xl italic text-zinc-300">{anime.tagline}</p>
              </div>
            )}

            {/* Reviews Section */}
            <ReviewSection animeId={Number(id)} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="rounded-xl bg-zinc-900 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                {t("status")}
              </h3>
              <p className="text-zinc-400">{anime.status}</p>
            </div>

            {/* Production Companies */}
            {anime.production_companies &&
              anime.production_companies.length > 0 && (
                <div className="rounded-xl bg-zinc-900 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-white">
                    {t("production")}
                  </h3>
                  <div className="space-y-2">
                    {anime.production_companies.map((company) => (
                      <p key={company.id} className="text-zinc-400">
                        {company.name}
                      </p>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </section>
    </div>
  );
}

