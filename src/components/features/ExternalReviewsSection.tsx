"use client";

import { useTranslations } from "next-intl";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ExternalReviewCard } from "./ExternalReviewCard";
import { Button } from "@/components/ui/button";
import type { TMDBReview } from "@/types/tmdb";
import type { AniListReview } from "@/lib/anilist/client";

type ExternalReview =
  | ({ source: "tmdb" } & TMDBReview)
  | ({ source: "anilist" } & AniListReview);

interface ExternalReviewsSectionProps {
  tmdbReviews: TMDBReview[];
  initialAnilistReviews: AniListReview[];
  anilistMediaId: number | null;
  locale: string;
}

export function ExternalReviewsSection({
  tmdbReviews,
  initialAnilistReviews,
  anilistMediaId,
  locale,
}: ExternalReviewsSectionProps) {
  const t = useTranslations("anime.detail");
  const tReview = useTranslations("review");

  // AniList 리뷰 무한 스크롤
  const {
    data: anilistData,
    fetchNextPage: fetchNextAnilistPage,
    hasNextPage: hasNextAnilistPage,
    isFetchingNextPage: isFetchingNextAnilistPage,
  } = useInfiniteQuery({
    queryKey: ["anilist-reviews", anilistMediaId],
    queryFn: async ({ pageParam = 1 }) => {
      if (!anilistMediaId) {
        return {
          reviews: [],
          page: 1,
          hasNextPage: false,
        };
      }

      const params = new URLSearchParams({
        mediaId: anilistMediaId.toString(),
        page: (pageParam as number).toString(),
        perPage: "10",
      });

      const response = await fetch(`/api/reviews/anilist?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch AniList reviews");
      }

      const result = await response.json();
      return {
        reviews: result.reviews || [],
        page: result.page || 1,
        hasNextPage: result.hasNextPage || false,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextPage) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: !!anilistMediaId,
    initialData: {
      pages: [
        {
          reviews: initialAnilistReviews,
          page: 1,
          hasNextPage: initialAnilistReviews.length === 10,
        },
      ],
      pageParams: [1],
    },
  });

  const allAnilistReviews =
    anilistData?.pages.flatMap((page) => page.reviews) || [];

  // TMDB와 AniList 리뷰 합치기
  const allReviews: ExternalReview[] = [
    ...tmdbReviews.map((review) => ({ source: "tmdb" as const, ...review })),
    ...allAnilistReviews.map((review) => ({
      source: "anilist" as const,
      ...review,
    })),
  ].sort((a, b) => {
    // 최신순 정렬
    const dateA =
      a.source === "tmdb"
        ? new Date(a.created_at).getTime()
        : a.createdAt * 1000;
    const dateB =
      b.source === "tmdb"
        ? new Date(b.created_at).getTime()
        : b.createdAt * 1000;
    return dateB - dateA;
  });

  return (
    <div className="space-y-4">
      {allReviews.length === 0 ? (
        <div className="rounded-xl bg-zinc-900 p-6 text-center">
          <p className="text-zinc-400 text-sm">{t("no_external_reviews")}</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {allReviews.map((review) => (
              <ExternalReviewCard
                key={`${review.source}-${
                  review.source === "tmdb" ? review.id : review.id
                }`}
                review={review}
                locale={locale}
              />
            ))}
          </div>

          {/* 더 보기 버튼 (AniList 리뷰만 페이지네이션) */}
          {hasNextAnilistPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                onClick={() => fetchNextAnilistPage()}
                disabled={isFetchingNextAnilistPage}
                className="text-sm"
              >
                {isFetchingNextAnilistPage
                  ? "로딩 중..."
                  : tReview("load_more_reviews")}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
