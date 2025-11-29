import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getReviewById } from "@/actions/review";
import { tmdbClient } from "@/lib/tmdb/client";
import { Badge } from "@/components/ui/badge";
import { Star, User, Calendar } from "lucide-react";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";
import { ReviewActions } from "@/components/features/ReviewActions";
import { StructuredData } from "@/components/features/StructuredData";
import { getAvatarEmoji } from "@/lib/utils/avatar";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "review.detail" });

  const reviewResult = await getReviewById(id);

  if (!reviewResult.success || !reviewResult.data) {
    return {
      title: t("untitled_review") + " | AniVerse",
      description: "리뷰를 찾을 수 없습니다.",
    };
  }

  const review = reviewResult.data;
  const displayName =
    (review.user_profiles as any)?.display_name ||
    (review.user_profiles as any)?.username ||
    "익명";

  // 언어 매핑
  const languageMap: Record<string, string> = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
  };
  const language = languageMap[locale] || "ko-KR";

  let anime;
  try {
    anime = await tmdbClient.getTVDetail(review.anime_id, language);
  } catch (error) {
    console.error("Failed to fetch anime:", error);
  }

  const title = review.title
    ? `${review.title} - ${anime?.name || "리뷰"} | AniVerse`
    : `${anime?.name || "애니메이션"} 리뷰 | AniVerse`;
  const description = review.content.slice(0, 160) || `${anime?.name || "애니메이션"}에 대한 리뷰입니다.`;

  return {
    title,
    description,
    keywords: [
      anime?.name,
      anime?.original_name,
      "리뷰",
      "review",
      displayName,
      "애니메이션",
      "anime",
    ],
    openGraph: {
      title,
      description,
      type: "article",
      locale: locale === "ko" ? "ko_KR" : locale === "ja" ? "ja_JP" : "en_US",
      siteName: "AniVerse",
      authors: [displayName],
      images: anime
        ? [
            {
              url: tmdbClient.getPosterURL(anime.poster_path),
              width: 500,
              height: 750,
              alt: anime.name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: anime ? [tmdbClient.getPosterURL(anime.poster_path)] : [],
    },
  };
}

interface ReviewDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ReviewDetailPage({
  params,
}: ReviewDetailPageProps) {
  const { locale, id } = await params;
  const t = await getTranslations("review.detail");

  // 리뷰 조회
  const reviewResult = await getReviewById(id);

  if (!reviewResult.success || !reviewResult.data) {
    notFound();
  }

  const review = reviewResult.data;

  // 인증 확인 (수정/삭제 버튼 표시용)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === review.user_id;

  // 애니메이션 정보 가져오기
  const languageMap: Record<string, string> = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
  };
  const language = languageMap[locale] || "ko-KR";

  let anime;
  try {
    anime = await tmdbClient.getTVDetail(review.anime_id, language);
  } catch (error) {
    console.error("Failed to fetch anime:", error);
    // 애니메이션 정보가 없어도 리뷰는 표시
  }

  const displayName =
    (review.user_profiles as any)?.display_name ||
    (review.user_profiles as any)?.username ||
    "익명";

  const posterUrl = anime ? tmdbClient.getPosterURL(anime.poster_path) : null;
  const backdropUrl = anime
    ? tmdbClient.getBackdropURL(anime.backdrop_path)
    : null;

  return (
    <main className="min-h-screen">
      {anime && (
        <StructuredData
          type="Review"
          anime={anime}
          review={review}
          locale={locale}
        />
      )}
      {/* Hero Section with Backdrop */}
      {backdropUrl && anime && (
        <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
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
        </section>
      )}

      <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 lg:px-8">
        {/* 리뷰 헤더 */}
        <div className="mb-8">
          {anime && (
            <Link
              href={ROUTES.ANIME.DETAIL(anime.id)}
              className="mb-4 inline-block text-blue-500 transition-colors hover:text-blue-400"
            >
              ← {anime.name}
            </Link>
          )}

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {review.title ? (
                <h1 className="mb-2 text-4xl font-bold text-white md:text-5xl">
                  {review.title}
                </h1>
              ) : (
                <h1 className="mb-2 text-4xl font-bold text-white md:text-5xl">
                  {t("untitled_review")}
                </h1>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="rating" className="gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {review.rating}/10
                </Badge>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(review.created_at).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {review.updated_at !== review.created_at && (
                  <span className="text-xs text-zinc-500">
                    ({t("edited")})
                  </span>
                )}
              </div>
            </div>

            {isOwner && <ReviewActions reviewId={review.id} />}
          </div>
        </div>

        {/* 작성자 정보 */}
        <div className="mb-8 flex items-center gap-4 rounded-xl bg-zinc-900 p-6">
          {(review.user_profiles as any)?.avatar_url ? (
            (() => {
              const avatarEmoji = getAvatarEmoji((review.user_profiles as any).avatar_url);
              return avatarEmoji ? (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-4xl">
                  {avatarEmoji}
                </div>
              ) : (
                <Image
                  src={(review.user_profiles as any).avatar_url}
                  alt={displayName}
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
              );
            })()
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
              <User className="h-8 w-8" />
            </div>
          )}
          <div>
            <Link
              href={ROUTES.PROFILE()}
              className="text-xl font-semibold text-white transition-colors hover:text-blue-500"
            >
              {displayName}
            </Link>
            {(review.user_profiles as any)?.username && (
              <p className="text-sm text-zinc-400">@{(review.user_profiles as any).username}</p>
            )}
          </div>
        </div>

        {/* 애니메이션 정보 카드 */}
        {anime && (
          <div className="mb-8 rounded-xl bg-zinc-900 p-6">
            <div className="flex gap-6">
              {posterUrl && (
                <Link
                  href={ROUTES.ANIME.DETAIL(anime.id)}
                  className="relative h-48 w-32 flex-shrink-0 overflow-hidden rounded-lg transition-transform hover:scale-105"
                >
                  <Image
                    src={posterUrl}
                    alt={anime.name}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </Link>
              )}
              <div className="flex-1">
                <Link
                  href={ROUTES.ANIME.DETAIL(anime.id)}
                  className="text-2xl font-bold text-white transition-colors hover:text-blue-500"
                >
                  {anime.name}
                </Link>
                {anime.overview && (
                  <p className="mt-2 line-clamp-3 text-zinc-400">
                    {anime.overview}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {anime.genres.map((genre) => (
                    <Badge key={genre.id} variant="default">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 리뷰 내용 */}
        <article className="rounded-xl bg-zinc-900 p-8">
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-lg leading-relaxed text-zinc-300">
              {review.content}
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}

