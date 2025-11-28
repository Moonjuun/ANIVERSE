"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TMDBGenre } from "@/types/tmdb";

interface AnimeFiltersProps {
  genres: TMDBGenre[];
  locale: string;
}

const SORT_OPTIONS = [
  { value: "popularity.desc", labelKey: "sort.popularity_desc" },
  { value: "popularity.asc", labelKey: "sort.popularity_asc" },
  { value: "vote_average.desc", labelKey: "sort.rating_desc" },
  { value: "vote_average.asc", labelKey: "sort.rating_asc" },
  { value: "first_air_date.desc", labelKey: "sort.release_desc" },
  { value: "first_air_date.asc", labelKey: "sort.release_asc" },
] as const;

// 최근 20년 연도 목록
const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 20 }, (_, i) => currentYear - i);
};

export function AnimeFilters({ genres, locale }: AnimeFiltersProps) {
  const t = useTranslations("anime.filters");
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedGenre, setSelectedGenre] = useState<number | null>(
    searchParams.get("genre") ? parseInt(searchParams.get("genre") || "0", 10) : null
  );
  const [selectedYear, setSelectedYear] = useState<number | null>(
    searchParams.get("year") ? parseInt(searchParams.get("year") || "0", 10) : null
  );
  const [selectedSort, setSelectedSort] = useState<string>(
    searchParams.get("sort") || "popularity.desc"
  );

  const yearOptions = getYearOptions();

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (selectedGenre) {
      params.set("genre", selectedGenre.toString());
    }
    if (selectedYear) {
      params.set("year", selectedYear.toString());
    }
    if (selectedSort !== "popularity.desc") {
      params.set("sort", selectedSort);
    }

    router.push(`/anime?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedGenre(null);
    setSelectedYear(null);
    setSelectedSort("popularity.desc");
    router.push("/anime");
  };

  const hasActiveFilters = selectedGenre !== null || selectedYear !== null || selectedSort !== "popularity.desc";

  return (
    <div className="mb-8 space-y-6 rounded-xl bg-zinc-900 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-zinc-400" />
          <h2 className="text-xl font-semibold text-white">{t("title")}</h2>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-zinc-400 hover:text-white"
          >
            <X className="mr-2 h-4 w-4" />
            {t("clear_all")}
          </Button>
        )}
      </div>

      {/* 장르 필터 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          {t("genre")}
        </label>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <Badge
              key={genre.id}
              variant={selectedGenre === genre.id ? "rating" : "default"}
              className="cursor-pointer transition-colors hover:bg-zinc-700"
              onClick={() => setSelectedGenre(selectedGenre === genre.id ? null : genre.id)}
            >
              {genre.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* 연도 필터 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          {t("year")}
        </label>
        <select
          value={selectedYear || ""}
          onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value, 10) : null)}
          className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{t("all_years")}</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* 정렬 옵션 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          {t("sort_by")}
        </label>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {SORT_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={selectedSort === option.value ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSelectedSort(option.value)}
              className={
                selectedSort === option.value
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : "text-zinc-400 hover:text-white"
              }
            >
              {t(option.labelKey)}
            </Button>
          ))}
        </div>
      </div>

      {/* 적용 버튼 */}
      <div className="flex justify-end">
        <Button onClick={applyFilters} className="bg-blue-600 text-white hover:bg-blue-500">
          {t("apply")}
        </Button>
      </div>
    </div>
  );
}

