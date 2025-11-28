import { getTranslations } from "next-intl/server";
import { tmdbClient } from "@/lib/tmdb/client";
import { SearchResultsClient } from "@/components/features/SearchResultsClient";
import { routing } from "@/i18n/routing";
import { SearchInput } from "@/components/features/SearchInput";
import { redirect } from "next/navigation";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { locale } = await params;
  const { q } = await searchParams;
  const t = await getTranslations("search");

  // 검색어가 없으면 홈으로 리다이렉트
  if (!q || !q.trim()) {
    redirect(`/${locale}`);
  }

  const query = q.trim();

  // 언어 매핑
  const languageMap: Record<string, string> = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
  };
  const language = languageMap[locale] || "ko-KR";

  // 초기 검색 결과 가져오기 (Server Component)
  let initialData;
  try {
    const result = await tmdbClient.search(query, 1, language);
    // 애니메이션 장르 ID는 16
    const ANIME_GENRE_ID = 16;
    // TV 쇼 중에서 애니메이션 장르만 필터링
    const animeResults = result.tv.results.filter(
      (show) => show.genre_ids && show.genre_ids.includes(ANIME_GENRE_ID)
    );
    initialData = {
      ...result.tv,
      results: animeResults,
      total_results: animeResults.length, // 필터링된 결과 수
    };
  } catch (error) {
    console.error("Search error:", error);
    initialData = {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    };
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
          {t("title")}
        </h1>
        <div className="max-w-md">
          <SearchInput />
        </div>
        <p className="mt-4 text-lg text-zinc-400">
          {t("results_for")} &quot;{query}&quot; ({initialData.total_results}{" "}
          {t("results")})
        </p>
      </div>

      {/* 클라이언트 컴포넌트로 무한 스크롤 처리 */}
      <SearchResultsClient
        initialData={initialData}
        query={query}
        locale={locale}
        language={language}
      />
    </main>
  );
}

