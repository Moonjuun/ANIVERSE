"use client";

import { useState, useEffect, useCallback } from "react";
import { getReviews, deleteReview } from "@/actions/review";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useToast } from "@/lib/utils/toast";
import { useAuthStore } from "@/stores/useAuthStore";
import Image from "next/image";
import type { Database } from "@/types/supabase";
import { getAvatarEmoji } from "@/lib/utils/avatar";
import { ReviewCardContent } from "./ReviewCardContent";

type Review = Database["public"]["Tables"]["reviews"]["Row"] & {
  user_profiles: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

interface ReviewListProps {
  animeId: number;
  onEdit?: (review: Review) => void;
  refreshKey?: number; // refresh를 위한 key
}

const INITIAL_DISPLAY_COUNT = 5;

export function ReviewList({ animeId, onEdit, refreshKey }: ReviewListProps) {
  const t = useTranslations("review");
  const toast = useToast();
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    const result = await getReviews(animeId);
    if (result.success && result.data) {
      setReviews(result.data as Review[]);
    }
    setLoading(false);
  }, [animeId]);

  useEffect(() => {
    // 데이터 페칭을 위한 useEffect 사용 (일반적인 패턴)
    void loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animeId, refreshKey]);

  const handleDelete = async (reviewId: string) => {
    if (!confirm(t("delete_confirm"))) {
      return;
    }

    setDeletingId(reviewId);
    const result = await deleteReview(reviewId);
    setDeletingId(null);

    if (result.success) {
      toast.success(t("delete_review"));
      loadReviews();
    } else {
      toast.error(result.error || t("delete_error"));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-xl bg-zinc-900 p-6">
            <div className="h-4 w-1/4 rounded bg-zinc-800" />
            <div className="mt-2 h-4 w-full rounded bg-zinc-800" />
            <div className="mt-2 h-4 w-3/4 rounded bg-zinc-800" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl bg-zinc-900 p-8 text-center">
        <p className="text-zinc-400">{t("no_reviews_yet")}</p>
      </div>
    );
  }

  const displayedReviews = reviews.slice(0, displayCount);
  const hasMore = reviews.length > displayCount;

  return (
    <div className="space-y-4">
      {displayedReviews.map((review) => {
        const isOwner = user?.id === review.user_id;
        const displayName =
          review.user_profiles?.display_name ||
          review.user_profiles?.username ||
          "익명";

        return (
          <div
            key={review.id}
            className="rounded-xl bg-zinc-900 p-6 transition-all duration-200 hover:bg-zinc-800"
          >
            {/* 헤더 */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                {review.user_profiles?.avatar_url ? (
                  (() => {
                    const avatarEmoji = getAvatarEmoji(
                      review.user_profiles.avatar_url
                    );
                    return avatarEmoji ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-2xl">
                        {avatarEmoji}
                      </div>
                    ) : (
                      <Image
                        src={review.user_profiles.avatar_url}
                        alt={displayName}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    );
                  })()
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-white md:text-base">
                    {displayName}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(review.created_at).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* 평점 및 액션 버튼 */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium text-white md:text-sm">
                    {review.rating}/10
                  </span>
                </div>
                {isOwner && (
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(review)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(review.id)}
                      disabled={deletingId === review.id}
                      className="h-8 w-8 p-0 text-rose-500 hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* 제목 */}
            {review.title && (
              <h4 className="mb-2 text-base font-semibold text-white md:text-lg">
                {review.title}
              </h4>
            )}

            {/* 내용 */}
            <ReviewCardContent content={review.content} />

            {/* 수정일 표시 */}
            {review.updated_at !== review.created_at && (
              <p className="mt-2 text-xs text-zinc-500">
                {new Date(review.updated_at).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                수정됨
              </p>
            )}
          </div>
        );
      })}

      {/* 더 보기 버튼 */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="secondary"
            onClick={() => setDisplayCount((prev) => prev + 5)}
            className="text-sm"
          >
            {t("load_more_reviews")} ({reviews.length - displayCount}개 더)
          </Button>
        </div>
      )}
    </div>
  );
}
