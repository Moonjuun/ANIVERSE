"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { TMDBWatchProvider } from "@/types/tmdb";

interface WatchProvidersProps {
  providers: TMDBWatchProvider[];
  locale: string;
  animeId: number;
  animeName: string;
  link?: string;
}

// 주요 OTT 서비스 이름 매핑
const providerNames: Record<string, { ko: string; en: string; ja: string }> = {
  "Netflix": { ko: "넷플릭스", en: "Netflix", ja: "Netflix" },
  "Disney Plus": { ko: "디즈니 플러스", en: "Disney Plus", ja: "Disney+" },
  "Amazon Prime Video": { ko: "아마존 프라임", en: "Amazon Prime Video", ja: "Amazon Prime Video" },
  "Apple TV Plus": { ko: "Apple TV+", en: "Apple TV+", ja: "Apple TV+" },
  "Hulu": { ko: "Hulu", en: "Hulu", ja: "Hulu" },
  "Crunchyroll": { ko: "크런치롤", en: "Crunchyroll", ja: "Crunchyroll" },
  "WATCHA": { ko: "왓챠", en: "WATCHA", ja: "WATCHA" },
  "wavve": { ko: "웨이브", en: "wavve", ja: "wavve" },
  "TVING": { ko: "티빙", en: "TVING", ja: "TVING" },
};

// OTT 서비스별 검색 링크 생성 함수
// 참고: 일부 서비스(왓챠, 티빙 등)는 외부 검색 링크를 제공하지 않으므로
// TMDB watch 페이지로 연결하여 사용자가 해당 서비스를 선택할 수 있도록 함
function getProviderSearchLink(
  providerName: string,
  animeName: string,
  animeId: number,
  locale: string,
  tmdbLink?: string
): string {
  const encodedName = encodeURIComponent(animeName);
  
  // TMDB link가 제공되면 우선 사용
  if (tmdbLink) {
    return tmdbLink;
  }
  
  switch (providerName) {
    case "Netflix":
      return `https://www.netflix.com/search?q=${encodedName}`;
    case "Disney Plus":
      return `https://www.disneyplus.com/search?q=${encodedName}`;
    case "Amazon Prime Video":
      return `https://www.amazon.com/s?k=${encodedName}&i=prime-instant-video`;
    case "Apple TV Plus":
      return `https://tv.apple.com/search?term=${encodedName}`;
    case "Hulu":
      return `https://www.hulu.com/search?q=${encodedName}`;
    case "Crunchyroll":
      return `https://www.crunchyroll.com/search?q=${encodedName}`;
    case "WATCHA":
    case "wavve":
    case "TVING":
      // 한국 OTT 서비스는 검색 링크가 불안정하므로 TMDB watch 페이지로 연결
      return `https://www.themoviedb.org/tv/${animeId}/watch`;
    default:
      // 기본적으로 TMDB watch 페이지로 연결
      return `https://www.themoviedb.org/tv/${animeId}/watch`;
  }
}

function getProviderName(providerName: string, locale: string): string {
  const mapping = providerNames[providerName];
  if (mapping) {
    return mapping[locale as keyof typeof mapping] || providerName;
  }
  return providerName;
}

export function WatchProviders({ providers, locale, animeId, animeName, link }: WatchProvidersProps) {
  const t = useTranslations("anime.detail");

  if (!providers || providers.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">
        {t("watch_on")}
      </h3>
      <div className="flex flex-wrap gap-3">
        {providers.map((provider) => {
          // 각 OTT 서비스의 검색 링크 생성
          const providerLink = getProviderSearchLink(
            provider.provider_name,
            animeName,
            animeId,
            locale,
            link
          );
          
          return (
            <a
              key={provider.provider_id}
              href={providerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 transition-all hover:bg-zinc-700"
              title={`${getProviderName(provider.provider_name, locale)}에서 시청하기`}
            >
            {provider.logo_path && (
              <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded">
                <Image
                  src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                  alt={provider.provider_name}
                  fill
                  className="object-contain"
                  sizes="24px"
                />
              </div>
            )}
              <span className="text-sm font-medium text-zinc-300 transition-colors group-hover:text-white">
                {getProviderName(provider.provider_name, locale)}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

