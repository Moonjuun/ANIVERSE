"use client";

import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useModalStore } from "@/stores/useModalStore";
import { useTranslations } from "next-intl";

interface AnimeActionsProps {
  onWriteReview?: () => void;
  onAddToFavorites?: () => void;
}

export function AnimeActions({
  onWriteReview,
  onAddToFavorites,
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
      <AuthGuard
        fallback={
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setLoginModalOpen(true)}
          >
            {t("add_to_favorites")}
          </Button>
        }
      >
        <Button variant="secondary" size="lg" onClick={onAddToFavorites}>
          {t("add_to_favorites")}
        </Button>
      </AuthGuard>
    </div>
  );
}

