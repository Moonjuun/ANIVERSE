/**
 * 라우트 상수 정의
 * 하드코딩된 경로를 사용하지 않고 이 상수를 사용해야 함
 *
 * ⚠️ next-intl의 Link를 사용할 때는 locale을 포함하지 않음 (자동 추가됨)
 * 예: <Link href={ROUTES.ANIME.DETAIL(id)}> (locale 불필요)
 */

export const ROUTES = {
  HOME: () => `/`,
  ANIME: {
    LIST: () => `/anime`,
    DETAIL: (id: string | number) => `/anime/${id}`,
  },
  PROFILE: () => `/profile`,
  REVIEWS: {
    LIST: () => `/reviews`,
    DETAIL: (id: string | number) => `/reviews/${id}`,
  },
  FAVORITES: () => `/favorites`,
  SEARCH: () => `/search`,
  TERMS: () => `/terms`,
  PRIVACY: () => `/privacy`,
} as const;
