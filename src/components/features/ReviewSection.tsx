"use client";

import { useState, useEffect } from "react";
import { getUserReview } from "@/actions/review";
import { ReviewForm } from "./ReviewForm";
import { ReviewTabs } from "./ReviewTabs";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useTranslations } from "next-intl";
import type { Database } from "@/types/supabase";
import type { TMDBReview } from "@/types/tmdb";
import type { AniListReview } from "@/lib/anilist/client";

type Review = Database["public"]["Tables"]["reviews"]["Row"];

interface ReviewSectionProps {
  animeId: number;
  tmdbReviews?: TMDBReview[];
  anilistReviews?: AniListReview[];
  anilistMediaId?: number | null;
  locale?: string;
}

export function ReviewSection({
  animeId,
  tmdbReviews = [],
  anilistReviews = [],
  anilistMediaId = null,
  locale = "ko",
}: ReviewSectionProps) {
  const t = useTranslations("review");
  const tDetail = useTranslations("anime.detail");
  const [showForm, setShowForm] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserReview();
  }, [animeId]);

  const loadUserReview = async () => {
    setLoading(true);
    const result = await getUserReview(animeId);
    if (result.success) {
      setExistingReview(result.data);
      setShowForm(!!result.data);
    }
    setLoading(false);
  };

  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setShowForm(false);
    loadUserReview();
    // ReviewList 새로고침을 위한 key 변경
    setRefreshKey((prev) => prev + 1);
  };

  const handleEdit = (review: Review) => {
    setExistingReview(review);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-zinc-900 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-1/4 rounded bg-zinc-800" />
          <div className="h-32 w-full rounded bg-zinc-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 리뷰 작성/수정 폼 */}
      {showForm ? (
        <div className="rounded-xl bg-zinc-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white md:text-xl">
            {existingReview ? tDetail("edit_review") : t("submit")}
          </h3>
          <ReviewForm
            animeId={animeId}
            existingReview={existingReview || undefined}
            onSuccess={handleSuccess}
            onCancel={() => {
              setShowForm(false);
              if (!existingReview) {
                setExistingReview(null);
              }
            }}
          />
        </div>
      ) : (
        <AuthGuard
          fallback={
            <div className="rounded-xl bg-zinc-900 p-6 text-center">
              <p className="mb-4 text-zinc-400">{t("no_reviews_yet")}</p>
              <Button onClick={() => setShowForm(true)}>
                {tDetail("write_review")}
              </Button>
            </div>
          }
        >
          {!existingReview && (
            <div className="rounded-xl bg-zinc-900 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white md:text-xl">
                  {tDetail("write_review")}
                </h3>
                <Button onClick={() => setShowForm(true)}>
                  {tDetail("write_review")}
                </Button>
              </div>
            </div>
          )}
        </AuthGuard>
      )}

      {/* 리뷰 탭 (외부 리뷰 / 내부 리뷰) */}
      <div>
        <h2 className="mb-6 text-2xl font-semibold text-white md:text-3xl">
          {tDetail("reviews")}
        </h2>
        <ReviewTabs
          animeId={animeId}
          tmdbReviews={tmdbReviews}
          anilistReviews={anilistReviews}
          anilistMediaId={anilistMediaId}
          locale={locale}
          onEdit={handleEdit}
          refreshKey={refreshKey}
        />
      </div>
    </div>
  );
}
