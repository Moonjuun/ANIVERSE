"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { addFavorite, removeFavorite, isFavorite } from "@/actions/favorite";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useModalStore } from "@/stores/useModalStore";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/lib/utils/toast";

interface FavoriteButtonProps {
  animeId: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "icon";
  className?: string;
}

export function FavoriteButton({
  animeId,
  size = "md",
  variant = "default",
  className,
}: FavoriteButtonProps) {
  const t = useTranslations("favorite");
  const toast = useToast();
  const { setLoginModalOpen } = useModalStore();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkFavorite();
  }, [animeId]);

  const checkFavorite = async () => {
    setLoading(true);
    const result = await isFavorite(animeId);
    if (result.success) {
      setFavorited(result.isFavorite);
    }
    setLoading(false);
  };

  const handleToggle = async () => {
    setSubmitting(true);

    try {
      if (favorited) {
        const result = await removeFavorite(animeId);
        if (result.success) {
          setFavorited(false);
          toast.success(t("remove"));
        } else {
          toast.error(result.error || t("remove_error"));
        }
      } else {
        const result = await addFavorite(animeId);
        if (result.success) {
          setFavorited(true);
          toast.success(t("add"));
        } else {
          toast.error(result.error || t("add_error"));
        }
      }
    } catch (error) {
      console.error("Favorite toggle error:", error);
      toast.error(t("unexpected_error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Button
        variant="secondary"
        size={size}
        disabled
        className={className}
      >
        <Heart className="h-4 w-4" />
        {variant === "default" && <span className="ml-2">{t("loading")}</span>}
      </Button>
    );
  }

  if (variant === "icon") {
    return (
      <AuthGuard
        fallback={
          <button
            onClick={() => setLoginModalOpen(true)}
            className={cn(
              "rounded-lg p-2 transition-colors hover:bg-zinc-800",
              className
            )}
          >
            <Heart className="h-5 w-5 text-zinc-400" />
          </button>
        }
      >
        <button
          onClick={handleToggle}
          disabled={submitting}
          className={cn(
            "rounded-lg p-2 transition-colors hover:bg-zinc-800",
            favorited && "text-rose-500",
            !favorited && "text-zinc-400",
            submitting && "opacity-50",
            className
          )}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-all duration-200",
              favorited && "fill-current"
            )}
          />
        </button>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard
      fallback={
        <Button
          variant="secondary"
          size={size}
          onClick={() => setLoginModalOpen(true)}
          className={className}
        >
          <Heart className="h-4 w-4" />
          <span className="ml-2">{t("add")}</span>
        </Button>
      }
    >
      <Button
        variant={favorited ? "primary" : "secondary"}
        size={size}
        onClick={handleToggle}
        disabled={submitting}
        className={className}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-all duration-200",
            favorited && "fill-current"
          )}
        />
        <span className="ml-2">
          {favorited ? t("remove") : t("add")}
        </span>
      </Button>
    </AuthGuard>
  );
}

