"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth/auth-guard";
import { FavoriteButton } from "./FavoriteButton";
import { useModalStore } from "@/stores/useModalStore";
import { useTranslations } from "next-intl";
import { Share2, MessageSquare, Plus } from "lucide-react";
import { useToast } from "@/lib/utils/toast";

interface AnimeActionsProps {
  animeId: number;
  animeName?: string;
}

export function AnimeActions({
  animeId,
  animeName,
}: AnimeActionsProps) {
  const t = useTranslations("anime.detail");
  const toast = useToast();
  const { setLoginModalOpen } = useModalStore();
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        setSharing(true);
        await navigator.share({
          title: animeName || "AniVerse",
          text: `${animeName || "이 애니메이션"}을 AniVerse에서 확인해보세요!`,
          url: window.location.href,
        });
      } catch (error) {
        // 사용자가 공유를 취소한 경우는 에러로 처리하지 않음
        if ((error as Error).name !== "AbortError") {
          console.error("Share error:", error);
        }
      } finally {
        setSharing(false);
      }
    } else {
      // Web Share API를 지원하지 않는 경우 클립보드에 복사
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(t("share_copied", { defaultValue: "링크가 복사되었습니다." }));
      } catch (error) {
        console.error("Copy error:", error);
        toast.error(t("share_error", { defaultValue: "공유에 실패했습니다." }));
      }
    }
  };

  const handleWriteReview = () => {
    // 리뷰 섹션으로 스크롤
    const reviewSection = document.getElementById("reviews-section");
    if (reviewSection) {
      reviewSection.scrollIntoView({ behavior: "smooth", block: "start" });
      // 리뷰 작성 요청 이벤트 발생
      setTimeout(() => {
        window.dispatchEvent(new Event("writeReviewRequest"));
      }, 300);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* 찜하기 버튼 */}
      <AuthGuard
        fallback={
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setLoginModalOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("add_to_collection", { defaultValue: "찜하기" })}
          </Button>
        }
      >
        <FavoriteButton animeId={animeId} size="lg" />
      </AuthGuard>

      {/* 공유 버튼 */}
      <Button
        variant="secondary"
        size="lg"
        onClick={handleShare}
        disabled={sharing}
        className="gap-2"
      >
        <Share2 className="h-4 w-4" />
        {t("share", { defaultValue: "공유" })}
      </Button>

      {/* 리뷰 쓰기 버튼 */}
      <AuthGuard
        fallback={
          <Button
            variant="primary"
            size="lg"
            onClick={() => setLoginModalOpen(true)}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            {t("write_review")}
          </Button>
        }
      >
        <Button
          variant="primary"
          size="lg"
          onClick={handleWriteReview}
          className="gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          {t("write_review")}
        </Button>
      </AuthGuard>
    </div>
  );
}

