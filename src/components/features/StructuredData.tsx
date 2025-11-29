import type { TMDBTVDetail } from "@/types/tmdb";
import type { Database } from "@/types/supabase";

type Review = Database["public"]["Tables"]["reviews"]["Row"] & {
  user_profiles: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

interface StructuredDataProps {
  type: "TVSeries" | "Review";
  anime?: TMDBTVDetail;
  review?: Review;
  locale?: string;
}

export function StructuredData({
  type,
  anime,
  review,
  locale = "ko",
}: StructuredDataProps) {
  if (type === "TVSeries" && anime) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "TVSeries",
      name: anime.name,
      alternateName: anime.original_name,
      description: anime.overview,
      image: anime.poster_path
        ? `https://image.tmdb.org/t/p/w500${anime.poster_path}`
        : undefined,
      aggregateRating: anime.vote_count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: anime.vote_average.toFixed(1),
            ratingCount: anime.vote_count,
            bestRating: "10",
            worstRating: "1",
          }
        : undefined,
      numberOfSeasons: anime.number_of_seasons,
      numberOfEpisodes: anime.number_of_episodes,
      datePublished: anime.first_air_date,
      genre: anime.genres.map((g) => g.name),
      inLanguage: locale === "ko" ? "ko" : locale === "ja" ? "ja" : "en",
      productionCompany: anime.production_companies.map((c) => ({
        "@type": "Organization",
        name: c.name,
      })),
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    );
  }

  if (type === "Review" && review && anime) {
    const displayName =
      (review.user_profiles as any)?.display_name ||
      (review.user_profiles as any)?.username ||
      "익명";

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Review",
      itemReviewed: {
        "@type": "TVSeries",
        name: anime.name,
        image: anime.poster_path
          ? `https://image.tmdb.org/t/p/w500${anime.poster_path}`
          : undefined,
      },
      author: {
        "@type": "Person",
        name: displayName,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: "10",
        worstRating: "1",
      },
      reviewBody: review.content,
      headline: review.title || `${anime.name} 리뷰`,
      datePublished: review.created_at,
      dateModified: review.updated_at,
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    );
  }

  return null;
}




