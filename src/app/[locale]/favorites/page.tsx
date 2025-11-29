import { getTranslations } from "next-intl/server";
import { getFavorites } from "@/actions/favorite";
import { AnimeGrid } from "@/components/anime/anime-grid";
import { tmdbClient } from "@/lib/tmdb/client";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface FavoritesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function FavoritesPage({ params }: FavoritesPageProps) {
  const { locale } = await params;
  const t = await getTranslations("favorite");

  // 찜하기 목록 가져오기
  const favoritesResult = await getFavorites();

  if (!favoritesResult.success) {
    // 인증되지 않은 경우 404 또는 로그인 페이지로 리다이렉트
    notFound();
  }

  const favorites = favoritesResult.data || [];

  if (favorites.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <h1 className="mb-8 text-4xl font-bold text-white md:text-5xl">
          {t("title")}
        </h1>
        <div className="rounded-xl bg-zinc-900 p-12 text-center">
          <p className="text-lg text-zinc-400">{t("no_favorites")}</p>
        </div>
      </main>
    );
  }

  // 언어 매핑
  const languageMap: Record<string, string> = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
  };
  const language = languageMap[locale] || "ko-KR";

  // TMDB에서 애니메이션 상세 정보 가져오기
  const animePromises = favorites.map((favorite) =>
    tmdbClient
      .getTVDetail(favorite.anime_id, language)
      .catch((error) => {
        console.error(
          `Failed to fetch anime ${favorite.anime_id}:`,
          error
        );
        return null;
      })
  );

  const animeResults = await Promise.all(animePromises);
  const animes = animeResults.filter(
    (anime): anime is NonNullable<typeof anime> => anime !== null
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold text-white md:text-5xl">
        {t("title")}
      </h1>
      {animes.length > 0 ? (
        <AnimeGrid animes={animes} locale={locale} />
      ) : (
        <div className="rounded-xl bg-zinc-900 p-12 text-center">
          <p className="text-lg text-zinc-400">{t("no_favorites")}</p>
        </div>
      )}
    </main>
  );
}




