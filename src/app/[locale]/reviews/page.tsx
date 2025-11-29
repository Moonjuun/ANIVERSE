import { getTranslations } from "next-intl/server";
import { getAllReviews } from "@/actions/review";
import { ReviewListClient } from "@/components/features/ReviewListClient";
import { tmdbClient } from "@/lib/tmdb/client";
import { routing } from "@/i18n/routing";
import type { TMDBTVDetail } from "@/types/tmdb";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface ReviewsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ReviewsPage({ params }: ReviewsPageProps) {
  const { locale } = await params;
  const t = await getTranslations("reviews.list");

  // 언어 매핑
  const languageMap: Record<string, string> = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
  };
  const language = languageMap[locale] || "ko-KR";

  // 초기 데이터 가져오기 (Server Component)
  const initialResult = await getAllReviews(1, 20);

  if (!initialResult.success) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="rounded-xl bg-zinc-900 p-8 text-center">
          <p className="text-zinc-400">{initialResult.error}</p>
        </div>
      </main>
    );
  }

  // 첫 페이지의 애니메이션 정보 가져오기
  const animePromises = initialResult.data.map((review) =>
    tmdbClient.getTVDetail(review.anime_id, language).catch(() => null)
  );

  const animeResults = await Promise.all(animePromises);
  const animes = animeResults.filter(
    (anime): anime is TMDBTVDetail => anime !== null
  );

  // 애니메이션을 anime_id로 매핑하여 전달 (클라이언트에서 사용하기 쉽게)

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-lg text-zinc-400">{t("subtitle")}</p>
      </div>

      {/* 클라이언트 컴포넌트로 무한 스크롤 처리 */}
      <ReviewListClient
        initialData={{
          reviews: initialResult.data as any,
          animes: animes,
          total: initialResult.total,
          page: initialResult.page,
          totalPages: initialResult.totalPages,
        }}
        locale={locale}
        language={language}
      />
    </main>
  );
}
