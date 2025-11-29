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
          'relative w-full max-w-4xl max-h-[90vh] rounded-xl bg-zinc-900 p-4 md:p-6 shadow-xl',
          'animate-in fade-in-0 zoom-in-95',
          'overflow-y-auto'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 mb-4 flex justify-end">
          <button
            onClick={() => {
              if (selectedAnimeIds.length === 3) {
                setOnboardingModalOpen(false);
              }
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white disabled:opacity-30"
            disabled={selectedAnimeIds.length !== 3}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 md:mb-6 text-center">
          <h2 className="mb-2 text-xl md:text-2xl font-semibold text-white">{t('title')}</h2>
          <p className="text-xs md:text-sm text-zinc-400">{t('subtitle')}</p>
          <p className="mt-2 text-xs md:text-sm text-zinc-500">
            {selectedAnimeIds.length} / 3 {t('selected')}
          </p>
        </div>

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
                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-900'
                    : 'hover:bg-zinc-700',
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
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                      <div className="rounded-full bg-blue-500 p-2">
                        <svg
                          className="h-6 w-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
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

        <div className="mt-4 md:mt-6 flex justify-center">
          <Button
            onClick={handleComplete}
            disabled={selectedAnimeIds.length !== 3 || loading}
            className="w-full md:min-w-[200px]"
          >
            {loading ? t('loading') : t('complete')}
          </Button>
        </div>
      </div>
    </div>
  );
}

