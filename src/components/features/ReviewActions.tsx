"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { deleteReview } from "@/actions/review";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/constants/routes";
import { useToast } from "@/lib/utils/toast";

interface ReviewActionsProps {
  reviewId: string;
}

export function ReviewActions({ reviewId }: ReviewActionsProps) {
  const t = useTranslations("review.detail");
  const toast = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(t("delete_confirm"))) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteReview(reviewId);
    setIsDeleting(false);

    if (result.success) {
      toast.success(t("delete") + " " + t("success", { defaultValue: "완료" }));
      router.push(ROUTES.REVIEWS.LIST());
    } else {
      toast.error(result.error || t("delete_error"));
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => router.push(`${ROUTES.REVIEWS.DETAIL(reviewId)}?edit=true`)}
      >
        <Edit2 className="mr-2 h-4 w-4" />
        {t("edit")}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-rose-500 hover:text-rose-400"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {isDeleting ? t("deleting") : t("delete")}
      </Button>
    </div>
  );
}

