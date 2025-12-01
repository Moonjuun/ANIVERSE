/**
 * AniList GraphQL API 클라이언트
 */

const ANILIST_API_URL = "https://graphql.anilist.co";

export interface AniListReview {
  id: number;
  summary: string | null;
  body: string | null;
  score: number | null;
  rating: number | null;
  user: {
    name: string;
    avatar: {
      large: string | null;
    } | null;
  };
  createdAt: number;
}

export interface AniListMedia {
  id: number;
  reviews: {
    nodes: AniListReview[];
    pageInfo: {
      hasNextPage: boolean;
      currentPage: number;
    };
  } | null;
}

export interface AniListResponse {
  data: {
    Media: AniListMedia | null;
  };
}

class AniListClient {
  private baseURL: string;

  constructor() {
    this.baseURL = ANILIST_API_URL;
  }

  /**
   * GraphQL 쿼리 실행
   */
  private async query<T>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch(this.baseURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      next: {
        revalidate: 3600, // 1시간 캐시
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AniList API error:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
        query,
        variables,
      });
      throw new Error(
        `AniList API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const result = await response.json();

    if (result.errors) {
      console.error("AniList GraphQL error:", {
        errors: result.errors,
        query,
        variables,
      });
      throw new Error(
        `AniList GraphQL error: ${JSON.stringify(result.errors)}`
      );
    }

    return result as T;
  }

  /**
   * 애니메이션 이름으로 AniList Media ID 찾기
   * TMDB의 애니메이션 이름을 사용하여 AniList에서 검색
   */
  async findMediaByTitle(
    title: string,
    originalTitle?: string
  ): Promise<number | null> {
    try {
      // 영어 제목 우선, 없으면 원제 사용
      const searchQuery = title || originalTitle || "";
      if (!searchQuery) {
        return null;
      }

      // AniList에서 검색
      const results = await this.searchMedia(searchQuery);

      if (results.length === 0) {
        // 원제로 다시 시도
        if (originalTitle && originalTitle !== title) {
          const originalResults = await this.searchMedia(originalTitle);
          if (originalResults.length > 0) {
            return originalResults[0].id;
          }
        }
        return null;
      }

      // 첫 번째 결과 반환 (가장 관련성 높은 결과)
      return results[0].id;
    } catch (error) {
      console.warn(
        "AniList search error:",
        error instanceof Error ? error.message : error
      );
      return null;
    }
  }

  /**
   * AniList Media ID로 리뷰 가져오기
   */
  async getReviews(
    mediaId: number,
    page: number = 1,
    perPage: number = 10
  ): Promise<AniListReview[]> {
    const query = `
      query ($id: Int, $page: Int, $perPage: Int) {
        Media(id: $id, type: ANIME) {
          id
          reviews(page: $page, perPage: $perPage, sort: CREATED_AT_DESC) {
            nodes {
              id
              summary
              body
              score
              rating
              user {
                name
                avatar {
                  large
                }
              }
              createdAt
            }
            pageInfo {
              hasNextPage
              currentPage
            }
          }
        }
      }
    `;

    const result = await this.query<AniListResponse>(query, {
      id: mediaId,
      page,
      perPage,
    });

    return result.data.Media?.reviews?.nodes || [];
  }

  /**
   * 애니메이션 이름으로 검색하여 Media ID 찾기
   */
  async searchMedia(
    query: string
  ): Promise<
    Array<{ id: number; title: { romaji: string; english: string | null } }>
  > {
    const graphqlQuery = `
      query ($search: String) {
        Page(page: 1, perPage: 10) {
          media(search: $search, type: ANIME) {
            id
            title {
              romaji
              english
            }
          }
        }
      }
    `;

    const result = await this.query<{
      data: {
        Page: {
          media: Array<{
            id: number;
            title: {
              romaji: string;
              english: string | null;
            };
          }>;
        };
      };
    }>(graphqlQuery, { search: query });

    return result.data.Page.media;
  }

  /**
   * 월드컵 후보 캐릭터 가져오기
   */
  async getWorldCupCandidates(options: {
    count: number;
    gender?: "Male" | "Female";
    mediaId?: number;
  }): Promise<
    Array<{
      id: number;
      name: { full: string };
      image: { large: string };
      media: {
        nodes: Array<{
          title: { userPreferred: string };
        }>;
      };
    }>
  > {
    const { count, gender, mediaId } = options;

    // mediaId가 있으면 해당 애니의 캐릭터, 없으면 전역 인기 캐릭터
    // perPage는 최대 50개로 제한
    const perPage = Math.min(count * 3, 50);
    
    let query: string;
    const variables: Record<string, unknown> = {
      perPage,
    };

    if (mediaId) {
      variables.mediaId = mediaId;
      // Media.characters도 gender 필터를 지원하지 않으므로, gender 필드를 쿼리에 포함하여 클라이언트에서 필터링
      query = `
        query ($mediaId: Int!, $perPage: Int!) {
          Media(id: $mediaId, type: ANIME) {
            characters(perPage: $perPage, sort: FAVOURITES_DESC) {
              nodes {
                id
                name {
                  full
                }
                image {
                  large
                }
                gender
                media {
                  nodes {
                    title {
                      userPreferred
                    }
                  }
                }
              }
            }
          }
        }
      `;
    } else {
      // Page.characters는 gender 필터를 지원하지 않으므로, 모든 캐릭터를 가져온 후 클라이언트에서 필터링
      query = `
        query ($perPage: Int!) {
          Page(page: 1, perPage: $perPage) {
            characters(sort: FAVOURITES_DESC) {
              id
              name {
                full
              }
              image {
                large
              }
              gender
              media {
                nodes {
                  title {
                    userPreferred
                  }
                }
              }
            }
          }
        }
      `;
    }

    const result = await this.query<{
      data: {
        Media?: {
          characters: {
            nodes: Array<{
              id: number;
              name: { full: string };
              image: { large: string };
              gender?: string | null;
              media: {
                nodes: Array<{
                  title: { userPreferred: string };
                }>;
              };
            }>;
          };
        };
        Page?: {
          characters: Array<{
            id: number;
            name: { full: string };
            image: { large: string };
            gender?: string | null;
            media: {
              nodes: Array<{
                title: { userPreferred: string };
              }>;
            };
          }>;
        };
      };
    }>(query, variables);

    // 결과 추출
    let candidates: Array<{
      id: number;
      name: { full: string };
      image: { large: string };
      gender?: string | null;
      media: {
        nodes: Array<{
          title: { userPreferred: string };
        }>;
      };
    }> = [];

    if (mediaId && result.data.Media?.characters?.nodes) {
      candidates = result.data.Media.characters.nodes;
    } else if (result.data.Page?.characters) {
      candidates = result.data.Page.characters;
    }

    // gender 필터링 (클라이언트에서 필터링)
    if (gender) {
      candidates = candidates.filter((char) => char.gender === gender);
    }

    // 이미지가 있는 것만 필터링
    const validCandidates = candidates.filter(
      (char) => char.image?.large && char.media?.nodes?.length > 0
    );

    // 무작위 셔플
    const shuffled = validCandidates.sort(() => Math.random() - 0.5);

    // 요청한 개수만큼 반환
    return shuffled.slice(0, count);
  }
}

// 싱글톤 인스턴스
export const anilistClient = new AniListClient();
