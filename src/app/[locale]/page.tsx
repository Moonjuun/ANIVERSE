import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { tmdbClient } from "@/lib/tmdb/client";
import { AnimeGrid } from "@/components/anime/anime-grid";
import { Hero } from "@/components/features/Hero";
import { MoodPick } from "@/components/features/MoodPick";
import { routing } from "@/i18n/routing";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  const title = t("hero_title");
  const description = t("hero_subtitle");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "ko" ? "ko_KR" : locale === "ja" ? "ja_JP" : "en_US",
      siteName: "AniVerse",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  // 언어 매핑: ko -> ko-KR, en -> en-US, ja -> ja-JP
  const languageMap: Record<string, string> = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
  };

  const language = languageMap[locale] || "ko-KR";

  // 현재 연도
  const currentYear = new Date().getFullYear();

  // 다양한 애니메이션 목록 가져오기 (병렬 처리)
  const [
    popularAnimes,
    topRatedAnimes,
    latestAnimes,
    trendingAnimes,
    thisYearAnimes,
  ] = await Promise.all([
    // 인기 애니메이션
    tmdbClient.getAnimeShows(1, language, false, {
      sortBy: "popularity.desc",
    }),
    // 평점 높은 애니메이션
    tmdbClient.getAnimeShows(1, language, false, {
      sortBy: "vote_average.desc",
    }),
    // 최신 애니메이션
    tmdbClient.getAnimeShows(1, language, false, {
      sortBy: "first_air_date.desc",
    }),
    // 트렌딩 (인기 상위, 2페이지)
    tmdbClient.getAnimeShows(2, language, false, {
      sortBy: "popularity.desc",
    }),
    // 올해의 애니메이션
    tmdbClient.getAnimeShows(1, language, false, {
      year: currentYear,
      sortBy: "popularity.desc",
    }),
  ]);

  // Hero 섹션용 애니메이션 (인기 상위 20개 중 backdrop_path가 있는 것만 필터링 후 랜덤 선택)
  const heroCandidates = popularAnimes.results
    .slice(0, 20)
    .filter((anime) => anime.backdrop_path);
  
  // 랜덤 선택 (매 요청마다 다른 애니메이션)
  const randomIndex = Math.floor(Math.random() * heroCandidates.length);
  const heroAnime = heroCandidates[randomIndex] || popularAnimes.results[0];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      {heroAnime && <Hero anime={heroAnime} locale={locale} />}

      {/* Mood Pick Section */}
      <MoodPick />

      {/* Content Section */}
      <div className="mx-auto max-w-7xl space-y-12 px-4 pb-12 md:px-6 lg:px-8">
        {/* 인기 애니메이션 */}
        <AnimeGrid
          animes={popularAnimes.results.slice(0, 20)}
          locale={locale}
          title={t("popular")}
          sectionId="popular"
        />

        {/* 평점 높은 애니메이션 */}
        <AnimeGrid
          animes={topRatedAnimes.results
            .filter((a) => a.vote_count > 100) // 최소 평가 수 필터
            .slice(0, 20)}
          locale={locale}
          title={t("top_rated")}
          sectionId="top-rated"
        />

        {/* 최신 애니메이션 */}
        <AnimeGrid
          animes={latestAnimes.results.slice(0, 20)}
          locale={locale}
          title={t("latest")}
          sectionId="latest"
        />

        {/* 트렌딩 */}
        <AnimeGrid
          animes={trendingAnimes.results.slice(0, 20)}
          locale={locale}
          title={t("trending")}
          sectionId="trending"
        />

        {/* 올해의 애니메이션 */}
        {thisYearAnimes.results.length > 0 && (
          <AnimeGrid
            animes={thisYearAnimes.results.slice(0, 20)}
            locale={locale}
            title={t("this_year")}
            sectionId="this-year"
          />
        )}
      </div>
    </main>
  );
}
