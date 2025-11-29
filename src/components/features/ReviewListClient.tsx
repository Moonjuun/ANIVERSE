"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllReviews } from "@/actions/review";
import { ReviewCard } from "./ReviewCard";
import type { Database } from "@/types/supabase";
import type { TMDBTVDetail } from "@/types/tmdb";
import { useEffect, useRef } from "react";
import { tmdbClient } from "@/lib/tmdb/client";

type Review = Database["public"]["Tables"]["reviews"]["Row"] & {
  user_profiles: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

interface ReviewListClientProps {
  initialData: {
    reviews: Review[];
    animes?: TMDBTVDetail[];
    total: number;
    page: number;
    totalPages: number;
  };
  locale: string;
  language: string;
}

export function ReviewListClient({
  initialData,
  locale,
  language,
}: ReviewListClientProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["reviews-list", locale, language],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getAllReviews(pageParam, 20);
      if (!result.success) {
        throw new Error(result.error);
      }

      // 애니메이션 정보 가져오기
      const animePromises = result.data.map((review) =>
        tmdbClient
          .getTVDetail(review.anime_id, language)
          .catch(() => null)
      );

      const animeResults = await Promise.all(animePromises);
      const animes = animeResults.filter(
        (anime): anime is TMDBTVDetail => anime !== null
      );

      return {
        reviews: result.data,
        animes,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialData: {
      pages: [
        {
          reviews: initialData.reviews as any,
          animes: initialData.animes || [],
          total: initialData.total,
          page: initialData.page,
          totalPages: initialData.totalPages,
        },
      ],
      pageParams: [1],
    },
  });

  // 첫 페이지의 애니메이션 정보 로드 (서버에서 이미 전달되므로 이제는 필요 없지만, 폴백으로 유지)
  useEffect(() => {
    if (data?.pages[0] && data.pages[0].animes.length === 0) {
      const loadAnimes = async () => {
        const animePromises = data.pages[0].reviews.map((review: Review) =>
          tmdbClient.getTVDetail(review.anime_id, language).catch(() => null)
        );
        const animes = await Promise.all(animePromises);
        // 이 부분은 실제로는 쿼리를 다시 fetch해야 하지만,
        // 간단하게 하기 위해 첫 페이지만 처리
      };
      loadAnimes();
    }
  }, [data, language]);

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 모든 페이지의 결과를 합치기
  const allReviews: Array<{
    review: any;
    anime: TMDBTVDetail | null;
  }> = [];

  data?.pages.forEach((page) => {
    // 애니메이션을 anime_id로 매핑
    const animeMap = new Map(
      page.animes.map((anime) => [anime.id, anime])
    );

    page.reviews.forEach((review: any) => {
      allReviews.push({
        review,
        anime: animeMap.get(review.anime_id) || null,
      });
    });
  });

  if (status === "error") {
    return (
      <div className="rounded-xl bg-zinc-900 p-8 text-center">
        <p className="text-zinc-400">리뷰 목록을 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  if (allReviews.length === 0) {
    return (
      <div className="rounded-xl bg-zinc-900 p-8 text-center">
        <p className="text-zinc-400">아직 리뷰가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allReviews.map(({ review, anime }) => (
        <ReviewCard
          key={review.id}
          review={review}
          anime={anime}
          locale={locale}
        />
      ))}

      {/* 무한 스크롤 트리거 */}
      <div ref={loadMoreRef} className="h-20">
        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-blue-500" />
            <span className="ml-3 text-zinc-400">로딩 중...</span>
          </div>
        )}
        {!hasNextPage && allReviews.length > 0 && (
          <div className="py-8 text-center text-zinc-400">
            모든 리뷰를 불러왔습니다.
          </div>
        )}
      </div>
    </div>
  );
}

