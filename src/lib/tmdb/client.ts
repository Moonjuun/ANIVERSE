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
  TMDBWatchProviders,
  TMDBReviewsResponse,
} from "@/types/tmdb";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

class TMDBClient {
  private accessToken: string;
  private baseURL: string;

  constructor() {
    this.accessToken = process.env.TMDB_ACCESS_TOKEN || "";
    this.baseURL = TMDB_BASE_URL;

    if (!this.accessToken) {
      console.warn("TMDB_ACCESS_TOKEN is not set in environment variables");
    }
  }

  private async fetch<T>(
    endpoint: string,
    params?: Record<string, string | number>,
    isClient: boolean = false
  ): Promise<T> {
    if (!this.accessToken) {
      throw new Error(
        "TMDB_ACCESS_TOKEN is not set. Please configure the environment variable."
      );
    }

    const searchParams = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params || {}).map(([k, v]) => [k, String(v)])
      )
    );

    const url = `${this.baseURL}${endpoint}?${searchParams.toString()}`;

    const fetchOptions: RequestInit & {
      next?: { revalidate: number };
    } = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    };

    // 서버 컴포넌트에서만 next 옵션 사용
    if (!isClient) {
      fetchOptions.next = {
        revalidate: 3600, // 1시간 캐시
      };
    }

    let response: Response;
    try {
      response = await fetch(url, fetchOptions);
    } catch (fetchError) {
      // 네트워크 에러 등
      console.error("[TMDBClient] Fetch error:", {
        endpoint,
        error:
          fetchError instanceof Error ? fetchError.message : String(fetchError),
      });
      throw new Error(
        `TMDB API network error: ${
          fetchError instanceof Error ? fetchError.message : String(fetchError)
        }`
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      // 404는 리뷰가 없는 것으로 처리 (일부 엔드포인트는 404를 반환할 수 있음)
      if (response.status === 404) {
        throw new Error("NOT_FOUND");
      }

      // 401 Unauthorized는 환경 변수 문제일 가능성 높음
      if (response.status === 401) {
        console.error("[TMDBClient] Unauthorized - Check TMDB_ACCESS_TOKEN:", {
          endpoint,
          status: response.status,
        });
        throw new Error(
          `TMDB API unauthorized (401): Please check TMDB_ACCESS_TOKEN environment variable`
        );
      }

      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    try {
      return await response.json();
    } catch (jsonError) {
      console.error("[TMDBClient] JSON parse error:", {
        endpoint,
        error:
          jsonError instanceof Error ? jsonError.message : String(jsonError),
      });
      throw new Error(
        `TMDB API response parse error: ${
          jsonError instanceof Error ? jsonError.message : String(jsonError)
        }`
      );
    }
  }

  /**
   * 인기 영화 목록 가져오기
   */
  async getPopularMovies(
    page: number = 1,
    language: string = "ko-KR"
  ): Promise<TMDBResponse<TMDBMovie>> {
    return this.fetch<TMDBResponse<TMDBMovie>>("/movie/popular", {
      page,
      language,
    });
  }

  /**
   * 인기 TV 쇼 목록 가져오기 (애니메이션 포함)
   */
  async getPopularTVShows(
    page: number = 1,
    language: string = "ko-KR"
  ): Promise<TMDBResponse<TMDBTVShow>> {
    return this.fetch<TMDBResponse<TMDBTVShow>>("/tv/popular", {
      page,
      language,
    });
  }

  /**
   * 애니메이션 장르 TV 쇼 가져오기
   */
  async getAnimeShows(
    page: number = 1,
    language: string = "ko-KR",
    isClient: boolean = false,
    options?: {
      genre?: number;
      year?: number;
      sortBy?:
        | "popularity.desc"
        | "popularity.asc"
        | "vote_average.desc"
        | "vote_average.asc"
        | "first_air_date.desc"
        | "first_air_date.asc";
    }
  ): Promise<TMDBResponse<TMDBTVShow>> {
    const params: Record<string, string | number> = {
      page,
      language,
      with_genres: "16", // 애니메이션 장르 ID는 16
      sort_by: options?.sortBy || "popularity.desc",
    };

    // 추가 장르 필터
    if (options?.genre) {
      params.with_genres = `16,${options.genre}`;
    }

    // 연도 필터
    if (options?.year) {
      params.first_air_date_year = options.year;
    }

    return this.fetch<TMDBResponse<TMDBTVShow>>(
      "/discover/tv",
      params,
      isClient
    );
  }

  /**
   * 영화 상세 정보 가져오기
   */
  async getMovieDetail(
    id: number,
    language: string = "ko-KR"
  ): Promise<TMDBDetail> {
    return this.fetch<TMDBDetail>(`/movie/${id}`, { language });
  }

  /**
   * TV 쇼 상세 정보 가져오기
   */
  async getTVDetail(
    id: number,
    language: string = "ko-KR"
  ): Promise<TMDBTVDetail> {
    return this.fetch<TMDBTVDetail>(`/tv/${id}`, { language });
  }

  /**
   * 검색 (영화 + TV)
   */
  async search(
    query: string,
    page: number = 1,
    language: string = "ko-KR",
    isClient: boolean = false
  ): Promise<{
    movies: TMDBResponse<TMDBMovie>;
    tv: TMDBResponse<TMDBTVShow>;
  }> {
    const [movies, tv] = await Promise.all([
      this.fetch<TMDBResponse<TMDBMovie>>(
        "/search/movie",
        {
          query,
          page,
          language,
        },
        isClient
      ),
      this.fetch<TMDBResponse<TMDBTVShow>>(
        "/search/tv",
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
  async getGenres(language: string = "ko-KR"): Promise<{
    movie: { genres: TMDBGenre[] };
    tv: { genres: TMDBGenre[] };
  }> {
    const [movie, tv] = await Promise.all([
      this.fetch<{ genres: TMDBGenre[] }>("/genre/movie/list", { language }),
      this.fetch<{ genres: TMDBGenre[] }>("/genre/tv/list", { language }),
    ]);

    return { movie, tv };
  }

  /**
   * TV 쇼 시청 가능한 OTT 서비스 가져오기
   */
  async getTVWatchProviders(
    id: number,
    language: string = "ko-KR"
  ): Promise<TMDBWatchProviders> {
    return this.fetch<TMDBWatchProviders>(`/tv/${id}/watch/providers`, {
      language,
    });
  }

  /**
   * TV 쇼 리뷰 가져오기
   * Note: TMDB API는 모든 TV 쇼에 리뷰를 제공하지 않습니다.
   * 리뷰가 없는 경우 빈 results 배열을 반환하거나 null을 반환할 수 있습니다.
   */
  async getTVReviews(
    id: number,
    page: number = 1,
    language: string = "ko-KR"
  ): Promise<TMDBReviewsResponse | null> {
    try {
      const response = await this.fetch<TMDBReviewsResponse>(
        `/tv/${id}/reviews`,
        {
          page,
          language,
        }
      );

      // 리뷰가 없는 경우도 정상 응답이므로 그대로 반환
      // total_results가 0이면 빈 배열이지만 정상 응답
      return response;
    } catch (error) {
      // 404나 다른 에러의 경우 null 반환 (리뷰가 없는 것으로 처리)
      if (error instanceof Error && error.message === "NOT_FOUND") {
        return null;
      }
      console.warn(
        `TMDB Reviews API error for TV ${id}:`,
        error instanceof Error ? error.message : error
      );
      return null;
    }
  }

  /**
   * 이미지 URL 생성
   */
  getImageURL(
    path: string | null,
    size: "w500" | "w780" | "original" = "w500"
  ): string {
    if (!path) {
      return "/images/placeholder-poster.svg"; // 플레이스홀더 이미지
    }
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  /**
   * 포스터 이미지 URL
   */
  getPosterURL(path: string | null): string {
    return this.getImageURL(path, "w500");
  }

  /**
   * 백드롭 이미지 URL
   */
  getBackdropURL(path: string | null): string {
    return this.getImageURL(path, "w780");
  }

  /**
   * 추천 애니메이션 가져오기 (Ani-Lab 추천 애니용)
   * 최대 3개 반환
   */
  async getRecommendations(
    genres: string,
    fromDate: string,
    toDate: string,
    sortBy: string,
    language: string = "ko-KR",
    count: number = 3
  ): Promise<TMDBTVShow[]> {
    const params: Record<string, string | number> = {
      page: 1,
      language,
      with_genres: `16,${genres}`, // 애니메이션 장르(16) + 선택한 장르
      "first_air_date.gte": fromDate,
      "first_air_date.lte": toDate,
      sort_by: sortBy,
      with_origin_country: "JP", // 일본 애니메이션 한정
      "vote_count.gte": 100, // 검증된 작품만
    };

    try {
      const response = await this.fetch<TMDBResponse<TMDBTVShow>>(
        "/discover/tv",
        params,
        false
      );

      // 결과가 있으면 포스터/백드롭이 있는 것만 필터링
      if (response.results && response.results.length > 0) {
        const candidates = response.results.filter(
          (anime) => anime.poster_path || anime.backdrop_path
        );

        if (candidates.length === 0) {
          return [];
        }

        // 중복 제거 및 랜덤 셔플
        const uniqueCandidates = Array.from(
          new Map(candidates.map((item) => [item.id, item])).values()
        );

        // 랜덤으로 섞기
        const shuffled = uniqueCandidates.sort(() => Math.random() - 0.5);

        // 요청한 개수만큼 반환 (최대 3개)
        return shuffled.slice(0, Math.min(count, 3));
      }

      return [];
    } catch (error) {
      console.error("getRecommendations error:", error);
      return [];
    }
  }
}

// 싱글톤 인스턴스
export const tmdbClient = new TMDBClient();

/**
 * 온보딩용 애니메이션 데이터 가져오기
 */
export async function getOnboardingAnime(
  language: string = "ko-KR"
): Promise<TMDBTVShow[]> {
  const { ONBOARDING_ANIME_IDS } = await import("@/constants/onboarding-anime");

  // 각 애니메이션의 상세 정보 가져오기
  const animeDetails = await Promise.all(
    ONBOARDING_ANIME_IDS.map((id) =>
      tmdbClient.getTVDetail(id, language).catch(() => null)
    )
  );

  // null 제거 및 타입 변환
  return animeDetails
    .filter((detail): detail is TMDBTVDetail => detail !== null)
    .map((detail) => ({
      id: detail.id,
      name: detail.name,
      original_name: detail.original_name,
      overview: detail.overview,
      poster_path: detail.poster_path,
      backdrop_path: detail.backdrop_path,
      first_air_date: detail.first_air_date,
      vote_average: detail.vote_average,
      vote_count: detail.vote_count,
      popularity: detail.popularity,
      genre_ids: detail.genres?.map((g) => g.id) || [],
      origin_country: detail.origin_country || [],
    }));
}
