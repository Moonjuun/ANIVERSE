'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ExternalReviewsSection } from './ExternalReviewsSection';
import { ReviewList } from './ReviewList';
import type { TMDBReview } from '@/types/tmdb';
import type { AniListReview } from '@/lib/anilist/client';
import type { Database } from '@/types/supabase';

type Review = Database['public']['Tables']['reviews']['Row'];

interface ReviewTabsProps {
  animeId: number;
  tmdbReviews: TMDBReview[];
  anilistReviews: AniListReview[];
  anilistMediaId: number | null;
  locale: string;
  onEdit?: (review: Review) => void;
  refreshKey?: number;
}

export function ReviewTabs({
  animeId,
  tmdbReviews,
  anilistReviews,
  anilistMediaId,
  locale,
  onEdit,
  refreshKey,
}: ReviewTabsProps) {
  const t = useTranslations('anime.detail');
  const externalReviewsCount = tmdbReviews.length + anilistReviews.length;
  
  // 외부 리뷰가 없으면 내부 리뷰만 표시
  const [activeTab, setActiveTab] = useState<'external' | 'internal'>(
    externalReviewsCount > 0 ? 'external' : 'internal'
  );

  // 외부 리뷰가 없으면 탭 없이 내부 리뷰만 표시
  if (externalReviewsCount === 0) {
    return (
      <ReviewList
        animeId={animeId}
        onEdit={onEdit}
        refreshKey={refreshKey}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 탭 헤더 */}
      <div className="border-b border-zinc-800">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('external')}
            className={`
              relative px-4 py-3 text-sm font-medium transition-colors
              ${
                activeTab === 'external'
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-zinc-300'
              }
            `}
          >
            {t('external_reviews', { count: externalReviewsCount })}
            {activeTab === 'external' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('internal')}
            className={`
              relative px-4 py-3 text-sm font-medium transition-colors
              ${
                activeTab === 'internal'
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-zinc-300'
              }
            `}
          >
            {t('reviews')}
            {activeTab === 'internal' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div>
        {activeTab === 'external' ? (
          <ExternalReviewsSection
            tmdbReviews={tmdbReviews}
            initialAnilistReviews={anilistReviews}
            anilistMediaId={anilistMediaId}
            locale={locale}
          />
        ) : (
          <ReviewList
            animeId={animeId}
            onEdit={onEdit}
            refreshKey={refreshKey}
          />
        )}
      </div>
    </div>
  );
}

