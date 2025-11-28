import { AnimeCard } from './anime-card';
import { SkeletonGrid } from '@/components/ui/skeleton';
import type { TMDBTVShow } from '@/types/tmdb';

interface AnimeGridProps {
  animes: TMDBTVShow[];
  locale?: string;
  title?: string;
  loading?: boolean;
}

export function AnimeGrid({ animes, locale = 'ko', title, loading }: AnimeGridProps) {
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

  return (
    <section className="space-y-6">
      {title && (
        <h2 className="text-2xl font-semibold text-white md:text-3xl">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {animes.map((anime) => (
          <AnimeCard key={anime.id} anime={anime} locale={locale} />
        ))}
      </div>
    </section>
  );
}

