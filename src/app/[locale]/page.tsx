import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { tmdbClient } from "@/lib/tmdb/client";
import { AnimeGrid } from "@/components/anime/anime-grid";
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

  // 언어 매핑: ko -> ko-KR, en -> en-US, ja -> ja-JP
  const languageMap: Record<string, string> = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
  };

  const language = languageMap[locale] || "ko-KR";

  // 인기 애니메이션 목록 가져오기
  const [popularAnimes, topRatedAnimes] = await Promise.all([
    tmdbClient.getAnimeShows(1, language),
    tmdbClient.getAnimeShows(1, language).then((data) => ({
      ...data,
      results: data.results
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 10),
    })),
  ]);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center gap-8 px-4 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            AniVerse에 오신 것을 환영합니다
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400 md:text-xl">
            애니메이션 리뷰와 추천을 한 곳에서 만나보세요
          </p>
        </div>
      </section>

      {/* Content Section */}
      <div className="mx-auto max-w-7xl space-y-12 px-4 pb-12 md:px-6 lg:px-8">
        <AnimeGrid
          animes={popularAnimes.results.slice(0, 10)}
          locale={locale}
          title="인기 애니메이션"
        />
        <AnimeGrid
          animes={topRatedAnimes.results}
          locale={locale}
          title="평점 높은 애니메이션"
        />
      </div>
    </main>
  );
}
