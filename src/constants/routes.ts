/**
 * 라우트 상수 정의
 * 하드코딩된 경로를 사용하지 않고 이 상수를 사용해야 함
 */

export const ROUTES = {
  HOME: (locale: string) => `/${locale}`,
  ANIME: {
    LIST: (locale: string) => `/${locale}/anime`,
    DETAIL: (locale: string, id: string | number) => `/${locale}/anime/${id}`,
  },
  PROFILE: (locale: string) => `/${locale}/profile`,
  REVIEWS: {
    LIST: (locale: string) => `/${locale}/reviews`,
    DETAIL: (locale: string, id: string | number) => `/${locale}/reviews/${id}`,
  },
} as const;

