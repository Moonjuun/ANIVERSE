"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useModalStore } from "@/stores/useModalStore";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/supabase";
import type { TMDBTVDetail } from "@/types/tmdb";

type Review = Database["public"]["Tables"]["reviews"]["Row"];

interface ProfileReviewCardProps {
  review: Review;
  anime: TMDBTVDetail | null;
}

export function ProfileReviewCard({ review, anime }: ProfileReviewCardProps) {
  const t = useTranslations("review");
  const { setDeleteReviewConfirmModalOpen, setDeleteReviewId } =
    useModalStore();

  const handleDeleteClick = () => {
    setDeleteReviewId(review.id);
    setDeleteReviewConfirmModalOpen(true);
  };

  return (
    <div className="rounded-xl bg-zinc-900 p-6">
      <div className="flex gap-4">
        {/* 애니메이션 포스터 */}
        {anime?.poster_path ? (
          <div className="shrink-0">
            <Image
              src={`https://image.tmdb.org/t/p/w154${anime.poster_path}`}
              alt={anime.name || "애니메이션 포스터"}
              width={80}
              height={120}
              className="rounded-lg object-cover"
            />
          </div>
        ) : (
          <div className="flex h-[120px] w-[80px] shrink-0 items-center justify-center rounded-lg bg-zinc-800">
            <span className="text-2xl">📺</span>
          </div>
        )}

        {/* 리뷰 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* 애니메이션 제목 */}
              {anime && (
                <h4 className="mb-1 text-sm font-medium text-blue-500">
                  {anime.name}
                </h4>
              )}

              {/* 리뷰 제목 */}
              <h3 className="font-semibold text-white">
                {review.title || "제목 없음"}
              </h3>

              {/* 리뷰 내용 */}
              <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
                {review.content}
              </p>

              {/* 작성일 */}
              <p className="mt-2 text-xs text-zinc-500">
                {new Date(review.created_at).toLocaleDateString("ko-KR")}
              </p>
            </div>

            {/* 삭제 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="shrink-0 text-zinc-400 hover:text-rose-500"
              aria-label={t("delete_review")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
