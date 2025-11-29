"use client";

import { useState, useEffect } from "react";
import { getUserReview } from "@/actions/review";
import { ReviewForm } from "./ReviewForm";
import { ReviewTabs } from "./ReviewTabs";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useModalStore } from "@/stores/useModalStore";
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
  const { setLoginModalOpen } = useModalStore();
  const [showForm, setShowForm] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserReview();
  }, [animeId]);

  // 외부에서 리뷰 작성 요청이 오면 폼 열기
  useEffect(() => {
    const handleRequest = () => {
      if (!existingReview && !showForm) {
        setShowForm(true);
      }
    };
    // 이벤트 리스너 등록 (AnimeActions에서 호출)
    window.addEventListener("writeReviewRequest", handleRequest);
    return () => {
      window.removeEventListener("writeReviewRequest", handleRequest);
    };
  }, [existingReview, showForm]);

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
    <div id="reviews-section" className="space-y-6">
      {/* 리뷰 작성/수정 폼 */}
      {showForm && (
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
      )}

      {/* 리뷰 탭 (외부 리뷰 / 내부 리뷰) */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white md:text-3xl">
            {tDetail("reviews")}
          </h2>
          {!showForm && (
            <AuthGuard
              fallback={
                <Button
                  variant="secondary"
                  onClick={() => setLoginModalOpen(true)}
                >
                  {tDetail("write_review")}
                </Button>
              }
            >
              {!existingReview && (
                <Button variant="secondary" onClick={() => setShowForm(true)}>
                  {tDetail("write_review")}
                </Button>
              )}
            </AuthGuard>
          )}
        </div>
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
