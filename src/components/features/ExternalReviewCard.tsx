"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { formatDate } from "@/lib/utils/date-format";
import { useTranslations } from "next-intl";
import type { TMDBReview } from "@/types/tmdb";
import type { AniListReview } from "@/lib/anilist/client";

type ExternalReview =
  | ({ source: "tmdb" } & TMDBReview)
  | ({ source: "anilist" } & AniListReview);

interface ExternalReviewCardProps {
  review: ExternalReview;
  locale: string;
}

const MAX_PREVIEW_LENGTH = 300;

export function ExternalReviewCard({
  review,
  locale,
}: ExternalReviewCardProps) {
  const t = useTranslations("review");
  const [isExpanded, setIsExpanded] = useState(false);

  const isTMDB = review.source === "tmdb";
  const isAniList = review.source === "anilist";

  const author = isTMDB ? review.author : review.user.name;
  const content = isTMDB ? review.content : review.body || review.summary || "";
  const createdAt = isTMDB
    ? new Date(review.created_at).getTime()
    : review.createdAt * 1000;
  const rating = isTMDB
    ? review.author_details.rating
    : review.rating || review.score;
  const avatarUrl = isTMDB
    ? review.author_details.avatar_path
      ? `https://image.tmdb.org/t/p/w45${review.author_details.avatar_path}`
      : null
    : review.user.avatar?.large || null;
  const reviewUrl = isTMDB
    ? review.url
    : `https://anilist.co/review/${review.id}`;

  const isLongContent = content.length > MAX_PREVIEW_LENGTH;
  const displayContent =
    isLongContent && !isExpanded
      ? content.substring(0, MAX_PREVIEW_LENGTH) + "..."
      : content;

  return (
    <div className="rounded-xl bg-zinc-900 p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* 아바타 */}
          {avatarUrl ? (
            <div className="relative h-10 w-10 shrink-0">
              <Image
                src={avatarUrl}
                alt={author}
                fill
                className="rounded-full object-cover"
                sizes="40px"
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
              <span className="text-zinc-400 text-sm font-medium">
                {author.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-white truncate md:text-base">
                {author}
              </span>
              {/* 출처 뱃지 */}
              {isTMDB && (
                <Badge
                  variant="default"
                  className="bg-blue-600 text-white text-xs"
                >
                  TMDB
                </Badge>
              )}
              {isAniList && (
                <Badge
                  variant="default"
                  className="bg-purple-600 text-white text-xs"
                >
                  AniList
                </Badge>
              )}
            </div>
            {rating && (
              <div className="flex items-center gap-1 text-xs text-zinc-400 md:text-sm">
                <span className="text-yellow-400">★</span>
                <span>{rating}/10</span>
              </div>
            )}
          </div>
        </div>

        {/* 외부 링크 */}
        <a
          href={reviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400 hover:text-blue-500 transition-colors shrink-0"
          aria-label={`${isTMDB ? "TMDB" : "AniList"}에서 리뷰 보기`}
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* 리뷰 내용 */}
      <div className="mb-4">
        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap md:text-base">
          {displayContent}
        </p>
        {isLongContent && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-400 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                {t("show_less", { defaultValue: "접기" })}
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                {t("read_more")}
              </>
            )}
          </button>
        )}
      </div>

      {/* 작성일 */}
      <div className="text-xs text-zinc-500">
        {formatDate(new Date(createdAt).toISOString(), locale)}
      </div>
    </div>
  );
}
