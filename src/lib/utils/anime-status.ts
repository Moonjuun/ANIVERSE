/**
 * TMDB TV Show Status 번역 유틸리티
 */

export type TMDBStatus = "Returning Series" | "Planned" | "In Production" | "Ended" | "Canceled" | "Pilot";

interface StatusTranslation {
  ko: string;
  en: string;
  ja: string;
  description?: {
    ko: string;
    en: string;
    ja: string;
  };
}

const statusTranslations: Record<string, StatusTranslation> = {
  "Returning Series": {
    ko: "방영 중",
    en: "Returning Series",
    ja: "放送中",
    description: {
      ko: "현재 방영 중인 시리즈입니다",
      en: "Currently airing series",
      ja: "現在放送中のシリーズです",
    },
  },
  "Planned": {
    ko: "예정",
    en: "Planned",
    ja: "予定",
    description: {
      ko: "방영 예정인 작품입니다",
      en: "Planned for release",
      ja: "放送予定の作品です",
    },
  },
  "In Production": {
    ko: "제작 중",
    en: "In Production",
    ja: "制作中",
    description: {
      ko: "현재 제작 중인 작품입니다",
      en: "Currently in production",
      ja: "現在制作中の作品です",
    },
  },
  "Ended": {
    ko: "종영",
    en: "Ended",
    ja: "終了",
    description: {
      ko: "방영이 종료된 작품입니다",
      en: "Series has ended",
      ja: "放送が終了した作品です",
    },
  },
  "Canceled": {
    ko: "취소됨",
    en: "Canceled",
    ja: "キャンセル",
    description: {
      ko: "제작이 취소된 작품입니다",
      en: "Series was canceled",
      ja: "制作がキャンセルされた作品です",
    },
  },
  "Pilot": {
    ko: "파일럿",
    en: "Pilot",
    ja: "パイロット",
    description: {
      ko: "파일럿 에피소드가 제작되었습니다",
      en: "Pilot episode produced",
      ja: "パイロットエピソードが制作されました",
    },
  },
};

export function translateStatus(status: string, locale: string): string {
  const translation = statusTranslations[status];
  if (!translation) {
    return status; // 번역이 없으면 원본 반환
  }

  const localeKey = locale as "ko" | "en" | "ja";
  return translation[localeKey] || status;
}

export function getStatusDescription(status: string, locale: string): string | undefined {
  const translation = statusTranslations[status];
  if (!translation || !translation.description) {
    return undefined;
  }

  return translation.description[locale as keyof typeof translation.description];
}

