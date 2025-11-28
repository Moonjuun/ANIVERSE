/**
 * 라우트 상수 정의
 * 하드코딩된 경로 문자열 사용 금지
 */
export const ROUTES = {
  HOME: '/',
  ANIME: {
    LIST: '/anime',
    DETAIL: (id: string | number) => `/anime/${id}`,
  },
  REVIEW: {
    LIST: '/reviews',
    DETAIL: (id: string | number) => `/reviews/${id}`,
  },
  USER: {
    PROFILE: (id: string) => `/user/${id}`,
    SETTINGS: '/user/settings',
  },
  ADMIN: {
    DASHBOARD: '/admin',
  },
} as const;

