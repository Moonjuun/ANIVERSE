"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { AnimeGrid } from "@/components/anime/anime-grid";
import type { TMDBResponse, TMDBTVShow } from "@/types/tmdb";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

interface AnimeListClientProps {
  initialData: TMDBResponse<TMDBTVShow>;
  locale: string;
  language: string;
  initialPage: number;
  filters?: {
    genre?: string;
    year?: string;
    sort?: string;
  };
}

export function AnimeListClient({
  initialData,
  locale,
  language,
  initialPage,
  filters,
}: AnimeListClientProps) {
  const t = useTranslations("common");
  const searchParams = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 필터 파라미터 구성
  const genre = filters?.genre || searchParams.get("genre") || "";
  const year = filters?.year || searchParams.get("year") || "";
  const sort = filters?.sort || searchParams.get("sort") || "popularity.desc";

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ["anime-list", locale, language, genre, year, sort],
    queryFn: async ({ pageParam }) => {
      try {
        const page = typeof pageParam === "number" ? pageParam : initialPage;
        // API Route를 통해 데이터 가져오기
        const params = new URLSearchParams({
          page: page.toString(),
          language,
        });
        if (genre) params.set("genre", genre);
        if (year) params.set("year", year);
        if (sort) params.set("sort", sort);

        const response = await fetch(`/api/anime?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        return result;
      } catch (err) {
        console.error("AnimeListClient queryFn error:", err);
        throw err;
      }
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
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const currentRef = loadMoreRef.current;
    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 모든 페이지의 결과를 합치기
  const allAnimes = data?.pages.flatMap((page) => page.results) || [];

  if (status === "error") {
    return (
      <div className="rounded-xl bg-zinc-900 p-8 text-center">
        <p className="text-zinc-400">{t("error")}</p>
        {error && (
          <p className="mt-2 text-sm text-rose-500">
            {error instanceof Error ? error.message : String(error)}
          </p>
        )}
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
            <span className="ml-3 text-zinc-400">{t("loading")}...</span>
          </div>
        )}
        {!hasNextPage && allAnimes.length > 0 && (
          <div className="py-8 text-center text-zinc-400">
            {t("all_loaded")}
          </div>
        )}
      </div>
    </div>
  );
}

