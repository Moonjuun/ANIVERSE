"use client";

import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth/auth-guard";
import { FavoriteButton } from "./FavoriteButton";
import { useModalStore } from "@/stores/useModalStore";
import { useTranslations } from "next-intl";

interface AnimeActionsProps {
  animeId: number;
  onWriteReview?: () => void;
}

export function AnimeActions({
  animeId,
  onWriteReview,
}: AnimeActionsProps) {
  const t = useTranslations("anime.detail");
  const { setLoginModalOpen } = useModalStore();

  return (
    <div className="flex gap-4">
      <AuthGuard
        fallback={
          <Button
            variant="primary"
            size="lg"
            onClick={() => setLoginModalOpen(true)}
          >
            {t("write_review")}
          </Button>
        }
      >
        <Button variant="primary" size="lg" onClick={onWriteReview}>
          {t("write_review")}
        </Button>
      </AuthGuard>
      <FavoriteButton animeId={animeId} size="lg" />
    </div>
  );
}

