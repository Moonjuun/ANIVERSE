'use client';

import { useState, useEffect } from 'react';
import { useModalStore } from '@/stores/useModalStore';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from 'next-intl';
import { ONBOARDING_ANIME_IDS } from '@/constants/onboarding-anime';
import { createClient } from '@/lib/supabase/client';
import { addFavorite } from '@/actions/favorite';
import { useToast } from '@/lib/utils/toast';
import Image from 'next/image';
import type { TMDBTVShow } from '@/types/tmdb';

interface OnboardingModalProps {
  animeData: TMDBTVShow[];
}

export function OnboardingModal({ animeData }: OnboardingModalProps) {
  const t = useTranslations('auth.onboarding');
  const { onboardingModalOpen, setOnboardingModalOpen } = useModalStore();
  const [selectedAnimeIds, setSelectedAnimeIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const supabase = createClient();

  // 애니메이션 데이터가 없으면 빈 배열
  const availableAnimes = animeData || [];

  const handleToggleAnime = (animeId: number) => {
    if (selectedAnimeIds.includes(animeId)) {
      setSelectedAnimeIds(selectedAnimeIds.filter((id) => id !== animeId));
    } else {
      if (selectedAnimeIds.length < 3) {
        setSelectedAnimeIds([...selectedAnimeIds, animeId]);
      }
    }
  };

  const handleComplete = async () => {
    if (selectedAnimeIds.length !== 3) {
      setError('3개의 애니메이션을 선택해주세요');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 선택한 애니메이션을 찜하기에 추가
      for (const animeId of selectedAnimeIds) {
        const result = await addFavorite(animeId);
        if (!result.success) {
          console.error(`Failed to add favorite: ${animeId}`, result.error);
        }
      }

      toast.success('온보딩이 완료되었습니다!');
      setOnboardingModalOpen(false);
      // 페이지 새로고침하여 추천 알고리즘이 작동하도록
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setLoading(false);
    }
  };

  if (!onboardingModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      onClick={() => {
        // 3개 선택 전에는 닫기 방지
        if (selectedAnimeIds.length === 3) {
          setOnboardingModalOpen(false);
        }
      }}
    >
      <div
        className={cn(
          'relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-xl bg-zinc-900 shadow-xl',
          'animate-in fade-in-0 zoom-in-95'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 - 고정 */}
        <div className="flex-shrink-0 px-4 md:px-6 pt-4 md:pt-6 pb-4 border-b border-zinc-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="mb-1 text-xl md:text-2xl font-semibold text-white">{t('title')}</h2>
              <p className="text-xs md:text-sm text-zinc-400">{t('subtitle')}</p>
            </div>
            <button
              onClick={() => {
                if (selectedAnimeIds.length === 3) {
                  setOnboardingModalOpen(false);
                }
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white disabled:opacity-30"
              disabled={selectedAnimeIds.length !== 3}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              {selectedAnimeIds.length} / 3 {t('selected')}
            </p>
            {selectedAnimeIds.length === 3 && (
              <span className="text-xs text-emerald-500 font-medium">✓ 선택 완료</span>
            )}
          </div>
        </div>

        {/* 스크롤 가능한 콘텐츠 영역 */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 scrollbar-hide">
          {/* 벤토 그리드 */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {availableAnimes.slice(0, 12).map((anime) => {
              const isSelected = selectedAnimeIds.includes(anime.id);
              const isDisabled = !isSelected && selectedAnimeIds.length >= 3;

              return (
                <button
                  key={anime.id}
                  type="button"
                  onClick={() => handleToggleAnime(anime.id)}
                  disabled={isDisabled}
                  className={cn(
                    'group relative overflow-hidden rounded-xl bg-zinc-800 transition-all duration-300',
                    isSelected
                      ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-900 scale-[1.02]'
                      : 'hover:bg-zinc-700 hover:scale-[1.01]',
                    isDisabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="aspect-[2/3] relative">
                    <Image
                      src={
                        anime.poster_path
                          ? `https://image.tmdb.org/t/p/w500${anime.poster_path}`
                          : '/images/placeholder-poster.svg'
                      }
                      alt={anime.name || 'Anime poster'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-blue-500/30 backdrop-blur-sm">
                        <div className="rounded-full bg-blue-500 p-2 shadow-lg">
                          <svg
                            className="h-6 w-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-2 md:p-3">
                    <p className="truncate text-xs md:text-sm font-medium text-white">{anime.name}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-rose-500/20 px-4 py-2 text-sm text-rose-500">
              {error}
            </div>
          )}
        </div>

        {/* 하단 버튼 - 고정 */}
        <div className="flex-shrink-0 px-4 md:px-6 py-4 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-sm">
          <Button
            onClick={handleComplete}
            disabled={selectedAnimeIds.length !== 3 || loading}
            className={cn(
              'w-full transition-all duration-200',
              selectedAnimeIds.length === 3
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            )}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {t('loading')}
              </span>
            ) : (
              t('complete')
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

