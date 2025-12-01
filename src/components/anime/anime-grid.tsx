import { AnimeCard } from './anime-card';
import { SkeletonGrid } from '@/components/ui/skeleton';
import type { TMDBTVShow } from '@/types/tmdb';

interface AnimeGridProps {
  animes: TMDBTVShow[];
  locale?: string;
  title?: string;
  loading?: boolean;
  sectionId?: string; // 섹션별 고유 식별자
}

export function AnimeGrid({ animes, locale = 'ko', title, loading, sectionId }: AnimeGridProps) {
  if (loading) {
    return (
      <section className="space-y-6">
        {title && (
          <h2 className="text-2xl font-semibold text-white md:text-3xl">
            {title}
          </h2>
        )}
        <SkeletonGrid count={animes.length || 10} />
      </section>
    );
  }

  if (animes.length === 0) {
    return null;
  }

  // 고유 키 생성: sectionId가 있으면 사용, 없으면 인덱스와 조합
  const getKey = (anime: TMDBTVShow, index: number) => {
    if (sectionId) {
      return `${sectionId}-${anime.id}`;
    }
    return `${anime.id}-${index}`;
  };

  return (
    <section className="space-y-6">
      {title && (
        <h2 className="text-2xl font-semibold text-white md:text-3xl">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {animes.map((anime, index) => (
          <AnimeCard key={getKey(anime, index)} anime={anime} locale={locale} />
        ))}
      </div>
    </section>
  );
}

