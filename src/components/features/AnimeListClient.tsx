"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { tmdbClient } from "@/lib/tmdb/client";
import { AnimeGrid } from "@/components/anime/anime-grid";
import type { TMDBResponse, TMDBTVShow } from "@/types/tmdb";
import { useEffect, useRef } from "react";

interface AnimeListClientProps {
  initialData: TMDBResponse<TMDBTVShow>;
  locale: string;
  language: string;
  initialPage: number;
}

export function AnimeListClient({
  initialData,
  locale,
  language,
  initialPage,
}: AnimeListClientProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["anime-list", locale, language],
    queryFn: async ({ pageParam = initialPage }) => {
      return tmdbClient.getAnimeShows(pageParam, language);
    },
    initialPageParam: initialPage,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialData: {
      pages: [initialData],
      pageParams: [initialPage],
    },
  });

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
  const allAnimes = data?.pages.flatMap((page) => page.results) || [];

  if (status === "error") {
    return (
      <div className="rounded-xl bg-zinc-900 p-8 text-center">
        <p className="text-zinc-400">애니메이션 목록을 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AnimeGrid animes={allAnimes} locale={locale} />

      {/* 무한 스크롤 트리거 */}
      <div ref={loadMoreRef} className="h-20">
        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-blue-500" />
            <span className="ml-3 text-zinc-400">로딩 중...</span>
          </div>
        )}
        {!hasNextPage && allAnimes.length > 0 && (
          <div className="py-8 text-center text-zinc-400">
            모든 애니메이션을 불러왔습니다.
          </div>
        )}
      </div>
    </div>
  );
}

