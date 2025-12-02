import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { tmdbClient } from "@/lib/tmdb/client";
import { anilistClient } from "@/lib/anilist/client";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Tv, Users } from "lucide-react";
import { ReviewSection } from "@/components/features/ReviewSection";
import { AnimeActions } from "@/components/features/AnimeActions";
import { StructuredData } from "@/components/features/StructuredData";
import { WatchProviders } from "@/components/features/WatchProviders";
import {
  translateStatus,
  getStatusDescription,
} from "@/lib/utils/anime-status";
import { formatDate } from "@/lib/utils/date-format";
import type { TMDBTVDetail } from "@/types/tmdb";
import type { AniListReview } from "@/lib/anilist/client";

export async function generateStaticParams() {
  // 동적 생성이므로 빈 배열 반환 (ISR 사용)
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  try {
    const { locale, id } = await params;

    // 언어 매핑
    const languageMap: Record<string, string> = {
      ko: "ko-KR",
      en: "en-US",
      ja: "ja-JP",
    };
    const language = languageMap[locale] || "ko-KR";

    // 타임아웃 설정 (10초)
    const metadataPromise = (async () => {
      const anime = await tmdbClient.getTVDetail(Number(id), language);
      const title = `${anime.name} | AniVerse`;
      const description =
        anime.overview || `${anime.name}에 대한 정보와 리뷰를 확인해보세요.`;
      const posterUrl = tmdbClient.getPosterURL(anime.poster_path);
      const genres = anime.genres.map((g) => g.name).join(", ");
      const ogImageUrl = `/api/og?title=${encodeURIComponent(
        anime.name
      )}&rating=${anime.vote_average.toFixed(1)}&poster=${encodeURIComponent(
        posterUrl
      )}`;

      return {
        title,
        description,
        keywords: [
          anime.name,
          anime.original_name,
          genres,
          "애니메이션",
          "anime",
          "리뷰",
          "review",
        ],
        openGraph: {
          title,
          description,
          type: "video.tv_show" as const,
          locale:
            locale === "ko" ? "ko_KR" : locale === "ja" ? "ja_JP" : "en_US",
          siteName: "AniVerse",
          images: [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: anime.name,
            },
          ],
        },
        twitter: {
          card: "summary_large_image" as const,
          title,
          description,
          images: [ogImageUrl],
        },
      };
    })();

    const timeoutPromise = new Promise<Metadata>((resolve) =>
      setTimeout(
        () =>
          resolve({
            title: "애니메이션 상세 | AniVerse",
            description: "애니메이션 정보를 불러오는 중...",
          }),
        10000
      )
    );

    try {
      return await Promise.race([metadataPromise, timeoutPromise]);
    } catch (error) {
      // 운영 환경에서도 에러를 로깅하되, 메타데이터는 기본값 반환
      console.error(`[generateMetadata] Failed to fetch anime ${id}:`, {
        error: error instanceof Error ? error.message : String(error),
        locale,
        id,
        hasAccessToken: !!process.env.TMDB_ACCESS_TOKEN,
      });
      return {
        title: "애니메이션 상세 | AniVerse",
        description: "애니메이션 정보를 불러올 수 없습니다.",
      };
    }
  } catch (error) {
    // params 파싱 실패 등 최상위 에러 처리
    console.error("[generateMetadata] Unexpected error:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      title: "애니메이션 상세 | AniVerse",
      description: "애니메이션 정보를 불러올 수 없습니다.",
    };
  }
}

interface AnimeDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function AnimeDetailPage({
  params,
}: AnimeDetailPageProps) {
  let locale: string;
  let id: string;
  let t: Awaited<ReturnType<typeof getTranslations>>;

  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
    id = resolvedParams.id;
  } catch (error) {
    console.error("[AnimeDetailPage] Failed to resolve params:", {
      error: error instanceof Error ? error.message : String(error),
    });
    notFound();
  }

  // next-intl static rendering을 위한 설정
  setRequestLocale(locale);

  try {
    t = await getTranslations("anime.detail");
  } catch (error) {
    console.error("[AnimeDetailPage] Failed to load translations:", {
      error: error instanceof Error ? error.message : String(error),
      locale,
    });
    // 번역 실패 시 기본 번역 함수 생성 (fallback)
    t = ((key: string) => key) as typeof t;
  }

  // 언어 매핑
  const languageMap: Record<string, string> = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
  };
  const language = languageMap[locale] || "ko-KR";

  // 애니메이션 상세 정보 가져오기
  let anime: TMDBTVDetail;
  let watchProviders;
  let tmdbReviews;
  let anilistReviews: AniListReview[] = [];
  let anilistMediaId: number | null = null;

  try {
    // Promise.allSettled를 사용하여 일부 실패해도 계속 진행
    const [animeResult, watchProvidersResult, tmdbReviewsResult] =
      await Promise.allSettled([
        tmdbClient.getTVDetail(Number(id), language),
        tmdbClient.getTVWatchProviders(Number(id), language).catch(() => null),
        tmdbClient.getTVReviews(Number(id), 1, language).catch(() => null),
      ]);

    // 애니메이션 상세 정보는 필수이므로 실패 시 에러 처리
    if (animeResult.status === "rejected") {
      const error = animeResult.reason;
      console.error("[AnimeDetailPage] TMDB API Error (getTVDetail):", {
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        animeId: id,
        locale,
        language,
        hasAccessToken: !!process.env.TMDB_ACCESS_TOKEN,
      });
      notFound();
      return; // TypeScript를 위한 early return
    }

    anime = animeResult.value;

    // watchProviders와 tmdbReviews는 선택사항이므로 실패해도 계속 진행
    if (watchProvidersResult.status === "fulfilled") {
      watchProviders = watchProvidersResult.value;
    } else {
      console.warn("[AnimeDetailPage] WatchProviders fetch failed:", {
        error:
          watchProvidersResult.reason instanceof Error
            ? watchProvidersResult.reason.message
            : String(watchProvidersResult.reason),
        animeId: id,
      });
    }

    if (tmdbReviewsResult.status === "fulfilled") {
      tmdbReviews = tmdbReviewsResult.value;
    } else {
      console.warn("[AnimeDetailPage] TMDB Reviews fetch failed:", {
        error:
          tmdbReviewsResult.reason instanceof Error
            ? tmdbReviewsResult.reason.message
            : String(tmdbReviewsResult.reason),
        animeId: id,
      });
    }

    // AniList 리뷰 가져오기 (비동기, 실패해도 계속 진행)
    // 타임아웃 설정 (5초)
    try {
      const anilistSearchPromise = anilistClient.findMediaByTitle(
        anime.name,
        anime.original_name
      );
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 5000)
      );

      anilistMediaId = await Promise.race([
        anilistSearchPromise,
        timeoutPromise,
      ]);

      if (anilistMediaId) {
        const anilistReviewsPromise = anilistClient.getReviews(
          anilistMediaId,
          1,
          10
        );
        const reviewsTimeoutPromise = new Promise<AniListReview[]>((resolve) =>
          setTimeout(() => resolve([]), 5000)
        );

        anilistReviews = await Promise.race([
          anilistReviewsPromise.catch((): AniListReview[] => []),
          reviewsTimeoutPromise,
        ]);

        if (process.env.NODE_ENV === "development") {
          console.log("AniList Reviews:", {
            mediaId: anilistMediaId,
            reviewsCount: anilistReviews.length,
          });
        }
      }
    } catch (anilistError) {
      console.warn("AniList API Error:", {
        error:
          anilistError instanceof Error
            ? anilistError.message
            : String(anilistError),
        animeId: id,
      });
      // AniList 에러는 무시하고 계속 진행
    }
  } catch (error) {
    // 예상치 못한 에러 처리
    console.error("[AnimeDetailPage] Unexpected Error:", {
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      animeId: id,
      locale,
      language,
      hasAccessToken: !!process.env.TMDB_ACCESS_TOKEN,
    });
    notFound();
    return; // TypeScript를 위한 early return
  }

  const posterUrl = tmdbClient.getPosterURL(anime.poster_path);
  const backdropUrl = tmdbClient.getBackdropURL(anime.backdrop_path);
  const rating = anime.vote_average.toFixed(1);

  // TMDB 리뷰 데이터 확인 및 로깅
  const tmdbReviewsList = tmdbReviews?.results || [];
  if (process.env.NODE_ENV === "development") {
    console.log("TMDB Reviews:", {
      hasReviews: !!tmdbReviews,
      totalResults: tmdbReviews?.total_results || 0,
      reviewsCount: tmdbReviewsList.length,
      firstReview: tmdbReviewsList[0]?.author || "none",
    });
  }

  // OTT 서비스 정보 추출 (한국 우선, 없으면 다른 국가)
  const koreaProviders = watchProviders?.results["KR"]?.flatrate || [];
  const usProviders = watchProviders?.results["US"]?.flatrate || [];
  const providers = koreaProviders.length > 0 ? koreaProviders : usProviders;

  return (
    <div className="min-h-screen">
      <StructuredData type="TVSeries" anime={anime} locale={locale} />
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
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-zinc-950/80 to-zinc-950" />
          </div>
        )}

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-12 md:px-6 lg:px-8">
          <div className="flex w-full flex-col gap-6 md:flex-row md:items-end">
            {/* Poster */}
            <div className="relative h-[400px] w-[266px] shrink-0 overflow-hidden rounded-xl shadow-2xl">
              <Image
                src={posterUrl}
                alt={anime.name}
                fill
                className="object-cover"
                priority
                sizes="266px"
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
                    <span>{formatDate(anime.first_air_date, locale)}</span>
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
              <AnimeActions animeId={Number(id)} animeName={anime.name} />
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
            <ReviewSection
              animeId={Number(id)}
              tmdbReviews={tmdbReviewsList}
              anilistReviews={anilistReviews}
              anilistMediaId={anilistMediaId}
              locale={locale}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Watch Providers (OTT) */}
            {providers && providers.length > 0 && (
              <WatchProviders
                providers={providers}
                locale={locale}
                animeId={Number(id)}
                animeName={anime.name}
                link={
                  watchProviders?.results["KR"]?.link ||
                  watchProviders?.results["US"]?.link
                }
              />
            )}

            {/* Status */}
            <div className="rounded-xl bg-zinc-900 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                {t("status")}
              </h3>
              <div className="space-y-2">
                <p className="text-lg font-medium text-white">
                  {translateStatus(anime.status, locale)}
                </p>
                {getStatusDescription(anime.status, locale) && (
                  <p className="text-sm text-zinc-400">
                    {getStatusDescription(anime.status, locale)}
                  </p>
                )}
              </div>
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
