import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { tmdbClient } from "@/lib/tmdb/client";
import { ROUTES } from "@/constants/routes";
import type { TMDBTVShow } from "@/types/tmdb";
import { Star } from "lucide-react";

interface AnimeCardProps {
  anime: TMDBTVShow;
  locale?: string;
}

export function AnimeCard({ anime, locale = 'ko' }: AnimeCardProps) {
  const posterUrl = tmdbClient.getPosterURL(anime.poster_path);
  const rating = anime.vote_average.toFixed(1);

  return (
    <Link href={ROUTES.ANIME.DETAIL(anime.id)}>
      <Card className="group cursor-pointer">
        <div className="relative aspect-[2/3] overflow-hidden rounded-t-xl">
          <Image
            src={posterUrl}
            alt={anime.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//9k="
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
        <CardContent className="space-y-2">
          <h3 className="line-clamp-2 text-lg font-semibold text-white">
            {anime.name}
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="rating" className="gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {rating}
            </Badge>
            {anime.first_air_date && (
              <span className="text-xs text-zinc-500">
                {new Date(anime.first_air_date).getFullYear()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

