import { getTranslations } from "next-intl/server";
import { tmdbClient } from "@/lib/tmdb/client";
import { AnimeGrid } from "@/components/anime/anime-grid";
import { routing } from "@/i18n/routing";
import { AnimeListClient } from "@/components/features/AnimeListClient";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface AnimeListPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; genre?: string; sort?: string }>;
}

export default async function AnimeListPage({
  params,
  searchParams,
}: AnimeListPageProps) {
  const { locale } = await params;
  const { page, genre, sort } = await searchParams;
  const t = await getTranslations("anime.list");

  // 언어 매핑
  const languageMap: Record<string, string> = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
  };
  const language = languageMap[locale] || "ko-KR";

  // 초기 데이터 가져오기 (Server Component)
  const initialPage = parseInt(page || "1", 10);
  const initialData = await tmdbClient.getAnimeShows(initialPage, language);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-lg text-zinc-400">{t("subtitle")}</p>
      </div>

      {/* 클라이언트 컴포넌트로 무한 스크롤 처리 */}
      <AnimeListClient
        initialData={initialData}
        locale={locale}
        language={language}
        initialPage={initialPage}
      />
    </main>
  );
}

