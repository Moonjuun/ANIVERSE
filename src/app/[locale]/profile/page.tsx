import { getTranslations } from "next-intl/server";
import { getProfile, getUserReviews } from "@/actions/profile";
import { getFavorites } from "@/actions/favorite";
import { ProfileForm } from "@/components/features/ProfileForm";
import { ReviewList } from "@/components/features/ReviewList";
import { AnimeGrid } from "@/components/anime/anime-grid";
import { DeleteAccountButton } from "@/components/features/DeleteAccountButton";
import { ProfileReviewCard } from "@/components/features/ProfileReviewCard";
import { tmdbClient } from "@/lib/tmdb/client";
import { routing } from "@/i18n/routing";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { User, Mail, Calendar } from "lucide-react";
import { AVATARS } from "@/lib/utils/avatars";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  const t = await getTranslations("profile");

  // 인증 확인
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/${locale}`);
  }

  // 프로필 조회
  const profileResult = await getProfile();
  if (!profileResult.success || !profileResult.data) {
    notFound();
  }

  const profile = profileResult.data;

  // 사용자 리뷰 목록 조회
  const reviewsResult = await getUserReviews();
  const reviews = reviewsResult.success ? reviewsResult.data : [];

  // 찜하기 목록 조회
  const favoritesResult = await getFavorites();
  const favorites = favoritesResult.success ? favoritesResult.data || [] : [];

  // 언어 매핑
  const languageMap: Record<string, string> = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
  };
  const language = languageMap[locale] || "ko-KR";

  // 찜한 애니메이션 상세 정보 가져오기
  const animePromises = favorites
    .slice(0, 12)
    .map((favorite) =>
      tmdbClient.getTVDetail(favorite.anime_id, language).catch(() => null)
    );

  const animeResults = await Promise.all(animePromises);
  const animes = animeResults.filter(
    (anime): anime is NonNullable<typeof anime> => anime !== null
  );

  // 리뷰한 애니메이션 상세 정보 가져오기
  const reviewAnimeIds = [...new Set(reviews.map((review) => review.anime_id))];
  const reviewAnimePromises = reviewAnimeIds
    .slice(0, 10)
    .map((animeId) =>
      tmdbClient.getTVDetail(animeId, language).catch(() => null)
    );

  const reviewAnimeResults = await Promise.all(reviewAnimePromises);
  const reviewAnimes = reviewAnimeResults.filter(
    (anime): anime is NonNullable<typeof anime> => anime !== null
  );

  // 리뷰와 애니메이션 정보 매핑
  const reviewAnimeMap = new Map(
    reviewAnimes.map((anime) => [anime.id, anime])
  );

  const displayName =
    profile.display_name ||
    profile.username ||
    user.email?.split("@")[0] ||
    "User";

  // 아바타 이모지 추출 (emoji: 형식인 경우)
  const getAvatarEmoji = (avatarUrl: string | null): string | null => {
    if (!avatarUrl || !avatarUrl.startsWith("emoji:")) {
      return null;
    }
    const avatarId = avatarUrl.replace("emoji:", "");
    const avatar = AVATARS.find((a) => a.id === avatarId);
    return avatar ? avatar.emoji : null;
  };

  const avatarEmoji = getAvatarEmoji(profile.avatar_url);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white md:text-5xl">
          {t("title")}
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* 프로필 정보 */}
        <div className="lg:col-span-1">
          <div className="rounded-xl bg-zinc-900 p-6">
            <div className="mb-6 flex flex-col items-center text-center">
              {profile.avatar_url ? (
                avatarEmoji ? (
                  <div className="mb-4 flex h-30 w-30 items-center justify-center rounded-full bg-zinc-800 text-5xl">
                    {avatarEmoji}
                  </div>
                ) : (
                  <Image
                    src={profile.avatar_url}
                    alt={displayName}
                    width={120}
                    height={120}
                    className="mb-4 rounded-full object-cover"
                  />
                )
              ) : (
                <div className="mb-4 flex h-30 w-30 items-center justify-center rounded-full bg-zinc-800 text-4xl text-zinc-400">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <h2 className="text-2xl font-bold text-white">{displayName}</h2>
              {profile.username && (
                <p className="mt-1 text-zinc-400">@{profile.username}</p>
              )}
            </div>

            <div className="space-y-4 border-t border-zinc-800 pt-6">
              <div className="flex items-center gap-3 text-zinc-400">
                <Mail className="h-5 w-5" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <Calendar className="h-5 w-5" />
                <span className="text-sm">
                  {new Date(profile.created_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {profile.bio && (
              <div className="mt-6 border-t border-zinc-800 pt-6">
                <p className="text-zinc-300">{profile.bio}</p>
              </div>
            )}
          </div>

          {/* 프로필 수정 폼 */}
          <div className="mt-6 rounded-xl bg-zinc-900 p-6">
            <h3 className="mb-4 text-xl font-semibold text-white">
              {t("edit_profile")}
            </h3>
            <ProfileForm profile={profile} />
            <DeleteAccountButton />
          </div>
        </div>

        {/* 활동 내역 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 내 리뷰 */}
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">
              {t("my_reviews")} ({reviews.length})
            </h2>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.slice(0, 5).map((review) => {
                  const anime = reviewAnimeMap.get(review.anime_id);
                  return (
                    <ProfileReviewCard
                      key={review.id}
                      review={review}
                      anime={anime || null}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl bg-zinc-900 p-8 text-center">
                <p className="text-zinc-400">{t("no_reviews")}</p>
              </div>
            )}
          </div>

          {/* 찜한 애니메이션 */}
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">
              {t("my_favorites")} ({favorites.length})
            </h2>
            {animes.length > 0 ? (
              <AnimeGrid animes={animes} locale={locale} />
            ) : (
              <div className="rounded-xl bg-zinc-900 p-8 text-center">
                <p className="text-zinc-400">{t("no_favorites")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
