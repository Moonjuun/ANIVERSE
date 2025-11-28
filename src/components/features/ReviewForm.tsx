"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createReview, updateReview, type CreateReviewInput } from "@/actions/review";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

const reviewSchema = z.object({
  rating: z.number().min(1).max(10),
  title: z.string().max(200).optional(),
  content: z.string().min(10, "리뷰 내용은 최소 10자 이상이어야 합니다."),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  animeId: number;
  existingReview?: {
    id: string;
    rating: number;
    title: string | null;
    content: string;
  } | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  animeId,
  existingReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const t = useTranslations("review");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating || 5,
      title: existingReview?.title || "",
      content: existingReview?.content || "",
    },
  });

  const currentRating = watch("rating");

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);

    try {
      if (existingReview) {
        // 수정
        const result = await updateReview({
          id: existingReview.id,
          rating: data.rating,
          title: data.title,
          content: data.content,
        });

        if (!result.success) {
          alert(result.error || t("update_error"));
          return;
        }
      } else {
        // 작성
        const input: CreateReviewInput = {
          anime_id: animeId,
          rating: data.rating,
          title: data.title,
          content: data.content,
        };

        const result = await createReview(input);

        if (!result.success) {
          alert(result.error || t("create_error"));
          return;
        }
      }

      onSuccess?.();
    } catch (error) {
      console.error("Review submission error:", error);
      alert(t("unexpected_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setValue("rating", rating, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 평점 선택 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-white">
          {t("rating")}
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => {
            const isActive =
              (hoveredRating !== null ? hoveredRating : currentRating) >= rating;
            return (
              <button
                key={rating}
                type="button"
                onClick={() => handleRatingClick(rating)}
                onMouseEnter={() => setHoveredRating(rating)}
                onMouseLeave={() => setHoveredRating(null)}
                className={cn(
                  "transition-colors duration-200",
                  isActive
                    ? "text-yellow-400"
                    : "text-zinc-600 hover:text-yellow-500"
                )}
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition-all duration-200",
                    isActive && "fill-current"
                  )}
                />
              </button>
            );
          })}
          <span className="ml-2 text-sm text-zinc-400">
            {hoveredRating !== null ? hoveredRating : currentRating}/10
          </span>
        </div>
        {errors.rating && (
          <p className="mt-1 text-sm text-rose-500">{errors.rating.message}</p>
        )}
      </div>

      {/* 제목 (선택사항) */}
      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium text-white"
        >
          {t("title")} <span className="text-zinc-500">({t("optional")})</span>
        </label>
        <input
          id="title"
          type="text"
          {...register("title")}
          placeholder={t("title_placeholder")}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-rose-500">{errors.title.message}</p>
        )}
      </div>

      {/* 내용 */}
      <div>
        <label
          htmlFor="content"
          className="mb-2 block text-sm font-medium text-white"
        >
          {t("content")}
        </label>
        <textarea
          id="content"
          rows={6}
          {...register("content")}
          placeholder={t("content_placeholder")}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-rose-500">{errors.content.message}</p>
        )}
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t("submitting")
            : existingReview
            ? t("update")
            : t("submit")}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t("cancel")}
          </Button>
        )}
      </div>
    </form>
  );
}

