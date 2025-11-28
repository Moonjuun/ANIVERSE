"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { AnimeGrid } from "@/components/anime/anime-grid";
import type { TMDBResponse, TMDBTVShow } from "@/types/tmdb";
import { useEffect, useRef } from "react";

interface SearchResultsClientProps {
  initialData: TMDBResponse<TMDBTVShow>;
  query: string;
  locale: string;
  language: string;
}

export function SearchResultsClient({
  initialData,
  query,
  locale,
  language,
}: SearchResultsClientProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["search", query, locale, language],
    queryFn: async ({ pageParam = 1 }) => {
      // API Route를 통해 데이터 가져오기
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&page=${pageParam}&language=${encodeURIComponent(language)}`
      );
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      const result = await response.json() as {
        movies: TMDBResponse<TMDBTVShow>;
        tv: TMDBResponse<TMDBTVShow>;
      };
      // 애니메이션 장르 ID는 16
      const ANIME_GENRE_ID = 16;
      // TV 쇼 중에서 애니메이션 장르만 필터링
      const animeResults = result.tv.results.filter(
        (show: TMDBTVShow) => show.genre_ids && show.genre_ids.includes(ANIME_GENRE_ID)
      );
      return {
        ...result.tv,
        results: animeResults,
        total_results: animeResults.length, // 정확한 개수는 아니지만 필터링된 결과 수
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialData: {
      pages: [initialData],
      pageParams: [1],
    },
    enabled: !!query.trim(),
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
        <p className="text-zinc-400">검색 결과를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  if (allAnimes.length === 0 && !isFetchingNextPage) {
    return (
      <div className="rounded-xl bg-zinc-900 p-8 text-center">
        <p className="text-zinc-400">검색 결과가 없습니다.</p>
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
            모든 검색 결과를 불러왔습니다.
          </div>
        )}
      </div>
    </div>
  );
}

