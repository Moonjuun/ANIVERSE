import { getTranslations } from "next-intl/server";
import { tmdbClient } from "@/lib/tmdb/client";
import { routing } from "@/i18n/routing";
import { AnimeListClient } from "@/components/features/AnimeListClient";
import { AnimeFilters } from "@/components/features/AnimeFilters";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface AnimeListPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; genre?: string; year?: string; sort?: string }>;
}

export default async function AnimeListPage({
  params,
  searchParams,
}: AnimeListPageProps) {
  const { locale } = await params;
  const { page, genre, year, sort } = await searchParams;
  const t = await getTranslations("anime.list");

  // 언어 매핑
  const languageMap: Record<string, string> = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
  };
  const language = languageMap[locale] || "ko-KR";

  // 장르 목록 가져오기
  const { tv } = await tmdbClient.getGenres(language);
  const animeGenres = tv.genres.filter((g) => g.id !== 16); // 애니메이션 장르 제외

  // 초기 데이터 가져오기 (Server Component)
  const initialPage = parseInt(page || "1", 10);
  const options: {
    genre?: number;
    year?: number;
    sortBy?: "popularity.desc" | "popularity.asc" | "vote_average.desc" | "vote_average.asc" | "first_air_date.desc" | "first_air_date.asc";
  } = {};

  if (genre) {
    options.genre = parseInt(genre, 10);
  }
  if (year) {
    options.year = parseInt(year, 10);
  }
  if (sort) {
    options.sortBy = sort as any;
  }

  const initialData = await tmdbClient.getAnimeShows(initialPage, language, false, options);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-lg text-zinc-400">{t("subtitle")}</p>
      </div>

      {/* 필터 컴포넌트 */}
      <AnimeFilters genres={animeGenres} locale={locale} />

      {/* 클라이언트 컴포넌트로 무한 스크롤 처리 */}
      <AnimeListClient
        initialData={initialData}
        locale={locale}
        language={language}
        initialPage={initialPage}
        filters={{ genre, year, sort }}
      />
    </main>
  );
}

