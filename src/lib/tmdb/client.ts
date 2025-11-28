/**
 * TMDB API 클라이언트
 */

import type {
  TMDBMovie,
  TMDBTVShow,
  TMDBResponse,
  TMDBDetail,
  TMDBTVDetail,
  TMDBGenre,
} from '@/types/tmdb';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

class TMDBClient {
  private accessToken: string;
  private baseURL: string;

  constructor() {
    this.accessToken = process.env.TMDB_ACCESS_TOKEN || '';
    this.baseURL = TMDB_BASE_URL;

    if (!this.accessToken) {
      console.warn('TMDB_ACCESS_TOKEN is not set in environment variables');
    }
  }

  private async fetch<T>(
    endpoint: string,
    params?: Record<string, string | number>,
    isClient: boolean = false
  ): Promise<T> {
    const searchParams = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params || {}).map(([k, v]) => [k, String(v)])
      )
    );

    const url = `${this.baseURL}${endpoint}?${searchParams.toString()}`;

    const fetchOptions: RequestInit = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    // 서버 컴포넌트에서만 next 옵션 사용
    if (!isClient) {
      (fetchOptions as any).next = {
        revalidate: 3600, // 1시간 캐시
      };
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TMDB API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * 인기 영화 목록 가져오기
   */
  async getPopularMovies(
    page: number = 1,
    language: string = 'ko-KR'
  ): Promise<TMDBResponse<TMDBMovie>> {
    return this.fetch<TMDBResponse<TMDBMovie>>('/movie/popular', {
      page,
      language,
    });
  }

  /**
   * 인기 TV 쇼 목록 가져오기 (애니메이션 포함)
   */
  async getPopularTVShows(
    page: number = 1,
    language: string = 'ko-KR'
  ): Promise<TMDBResponse<TMDBTVShow>> {
    return this.fetch<TMDBResponse<TMDBTVShow>>('/tv/popular', {
      page,
      language,
    });
  }

  /**
   * 애니메이션 장르 TV 쇼 가져오기
   */
  async getAnimeShows(
    page: number = 1,
    language: string = 'ko-KR',
    isClient: boolean = false
  ): Promise<TMDBResponse<TMDBTVShow>> {
    // 애니메이션 장르 ID는 16
    return this.fetch<TMDBResponse<TMDBTVShow>>(
      '/discover/tv',
      {
        page,
        language,
        with_genres: '16',
        sort_by: 'popularity.desc',
      },
      isClient
    );
  }

  /**
   * 영화 상세 정보 가져오기
   */
  async getMovieDetail(
    id: number,
    language: string = 'ko-KR'
  ): Promise<TMDBDetail> {
    return this.fetch<TMDBDetail>(`/movie/${id}`, { language });
  }

  /**
   * TV 쇼 상세 정보 가져오기
   */
  async getTVDetail(
    id: number,
    language: string = 'ko-KR'
  ): Promise<TMDBTVDetail> {
    return this.fetch<TMDBTVDetail>(`/tv/${id}`, { language });
  }

  /**
   * 검색 (영화 + TV)
   */
  async search(
    query: string,
    page: number = 1,
    language: string = 'ko-KR',
    isClient: boolean = false
  ): Promise<{
    movies: TMDBResponse<TMDBMovie>;
    tv: TMDBResponse<TMDBTVShow>;
  }> {
    const [movies, tv] = await Promise.all([
      this.fetch<TMDBResponse<TMDBMovie>>(
        '/search/movie',
        {
          query,
          page,
          language,
        },
        isClient
      ),
      this.fetch<TMDBResponse<TMDBTVShow>>(
        '/search/tv',
        {
          query,
          page,
          language,
        },
        isClient
      ),
    ]);

    return { movies, tv };
  }

  /**
   * 장르 목록 가져오기
   */
  async getGenres(language: string = 'ko-KR'): Promise<{
    movie: { genres: TMDBGenre[] };
    tv: { genres: TMDBGenre[] };
  }> {
    const [movie, tv] = await Promise.all([
      this.fetch<{ genres: TMDBGenre[] }>('/genre/movie/list', { language }),
      this.fetch<{ genres: TMDBGenre[] }>('/genre/tv/list', { language }),
    ]);

    return { movie, tv };
  }

  /**
   * 이미지 URL 생성
   */
  getImageURL(path: string | null, size: 'w500' | 'w780' | 'original' = 'w500'): string {
    if (!path) {
      return '/images/placeholder-poster.png'; // 플레이스홀더 이미지
    }
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  /**
   * 포스터 이미지 URL
   */
  getPosterURL(path: string | null): string {
    return this.getImageURL(path, 'w500');
  }

  /**
   * 백드롭 이미지 URL
   */
  getBackdropURL(path: string | null): string {
    return this.getImageURL(path, 'w780');
  }
}

// 싱글톤 인스턴스
export const tmdbClient = new TMDBClient();

