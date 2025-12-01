"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/features/FavoriteButton";
import { ROUTES } from "@/constants/routes";
import type { TMDBTVShow } from "@/types/tmdb";
import { tmdbClient } from "@/lib/tmdb/client";

type Step = 0 | 1 | 2 | 3 | 4;

interface Answers {
  mood?: {
    id: string;
    genre: string;
    diagnosis: string;
  };
  era?: {
    id: string;
    fromDate: string;
    toDate: string;
  };
  style?: {
    id: string;
    sortBy: string;
  };
}

// Step 1: Mood 데이터 (진단명은 번역 키로 처리)
const getMoodOptions = (t: any) => [
  {
    id: "funny",
    emoji: "🤣",
    label: t("mood_funny"),
    genre: "35", // Comedy
    diagnosis: t("diagnosis_funny"),
  },
  {
    id: "action",
    emoji: "🔥",
    label: t("mood_action"),
    genre: "10759", // Action & Adventure
    diagnosis: t("diagnosis_action"),
  },
  {
    id: "drama",
    emoji: "😭",
    label: t("mood_drama"),
    genre: "18", // Drama
    diagnosis: t("diagnosis_drama"),
  },
  {
    id: "thriller",
    emoji: "👻",
    label: t("mood_thriller"),
    genre: "9648", // Mystery
    diagnosis: t("diagnosis_thriller"),
  },
  {
    id: "fantasy",
    emoji: "🧚",
    label: t("mood_fantasy"),
    genre: "10765", // Sci-Fi & Fantasy
    diagnosis: t("diagnosis_fantasy"),
  },
];

// Step 2: Era 데이터
const getEraOptions = (t: any) => [
  {
    id: "latest",
    emoji: "✨",
    label: t("era_latest"),
    fromDate: "2021-01-01",
    toDate: new Date().toISOString().split("T")[0],
  },
  {
    id: "golden",
    emoji: "🏆",
    label: t("era_golden"),
    fromDate: "2010-01-01",
    toDate: "2020-12-31",
  },
  {
    id: "classic",
    emoji: "📺",
    label: t("era_classic"),
    fromDate: "1990-01-01",
    toDate: "2009-12-31",
  },
];

// Step 3: Style 데이터
const getStyleOptions = (t: any) => [
  {
    id: "popular",
    emoji: "👑",
    label: t("style_popular"),
    sortBy: "popularity.desc",
  },
  {
    id: "hidden",
    emoji: "💎",
    label: t("style_hidden"),
    sortBy: "vote_average.desc",
  },
];

// 부작용 멘트
const getSideEffects = (t: any) => [
  t("side_effect_1"),
  t("side_effect_2"),
  t("side_effect_3"),
  t("side_effect_4"),
  t("side_effect_5"),
];

interface RecommendationWizardProps {
  locale: string;
}

export function RecommendationWizard({ locale }: RecommendationWizardProps) {
  const t = useTranslations("recommend");
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [results, setResults] = useState<TMDBTVShow[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // 언어 매핑
  const languageMap: Record<string, string> = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
  };
  const language = languageMap[locale] || "ko-KR";

  const handleMoodSelect = (mood: ReturnType<typeof getMoodOptions>[0]) => {
    setAnswers({
      ...answers,
      mood: {
        id: mood.id,
        genre: mood.genre,
        diagnosis: mood.diagnosis,
      },
    });
    setStep(2);
  };

  const handleEraSelect = (era: ReturnType<typeof getEraOptions>[0]) => {
    setAnswers({
      ...answers,
      era: {
        id: era.id,
        fromDate: era.fromDate,
        toDate: era.toDate,
      },
    });
    setStep(3);
  };

  const handleStyleSelect = async (style: ReturnType<typeof getStyleOptions>[0]) => {
    setAnswers({
      ...answers,
      style: {
        id: style.id,
        sortBy: style.sortBy,
      },
    });
    setStep(4);
    setIsAnalyzing(true);

    // 추천 애니메이션 가져오기 (API Route를 통해)
    try {
      const params = new URLSearchParams({
        genres: answers.mood!.genre,
        fromDate: answers.era!.fromDate,
        toDate: answers.era!.toDate,
        sortBy: style.sortBy,
        language,
      });

      const response = await fetch(`/api/recommend?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get recommendation");
      }

      const data = await response.json();
      
      if (data.recommendations && data.recommendations.length > 0) {
        setResults(data.recommendations);
      } else {
        // 결과가 없으면 빈 배열
        setResults([]);
      }
    } catch (error) {
      console.error("Recommendation error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRestart = () => {
    setStep(0);
    setAnswers({});
    setResults([]);
  };

  // 시작 화면
  if (step === 0) {
    return (
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
          {t("welcome_title")}
        </h1>
        <p className="mb-8 text-lg text-zinc-400 md:text-xl">
          {t("welcome_subtitle")}
        </p>
        <Button size="lg" onClick={() => setStep(1)}>
          {t("start_button")}
        </Button>
      </div>
    );
  }

  // Step 1: Mood 선택
  if (step === 1) {
    return (
      <div className="w-full max-w-4xl">
        <h2 className="mb-8 text-center text-3xl font-bold text-white">
          {t("step1_question")}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {getMoodOptions(t).map((mood) => (
            <Card
              key={mood.id}
              className="cursor-pointer"
              onClick={() => handleMoodSelect(mood)}
            >
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <span className="mb-4 text-5xl">{mood.emoji}</span>
                <span className="text-lg font-semibold text-white">
                  {mood.label}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Era 선택
  if (step === 2) {
    return (
      <div className="w-full max-w-4xl">
        <h2 className="mb-8 text-center text-3xl font-bold text-white">
          {t("step2_question")}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {getEraOptions(t).map((era) => (
            <Card
              key={era.id}
              className="cursor-pointer"
              onClick={() => handleEraSelect(era)}
            >
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <span className="mb-4 text-5xl">{era.emoji}</span>
                <span className="text-lg font-semibold text-white">
                  {era.label}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Step 3: Style 선택
  if (step === 3) {
    return (
      <div className="w-full max-w-4xl">
        <h2 className="mb-8 text-center text-3xl font-bold text-white">
          {t("step3_question")}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {getStyleOptions(t).map((style) => (
            <Card
              key={style.id}
              className="cursor-pointer"
              onClick={() => handleStyleSelect(style)}
            >
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <span className="mb-4 text-5xl">{style.emoji}</span>
                <span className="text-lg font-semibold text-white">
                  {style.label}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Step 4: 로딩 또는 결과
  if (step === 4) {
    if (isAnalyzing) {
      return (
        <div className="text-center">
          <div className="mb-6 inline-block h-16 w-16 animate-spin rounded-full border-4 border-zinc-600 border-t-blue-500" />
          <p className="text-xl text-zinc-400">{t("analyzing")}</p>
        </div>
      );
    }

    if (!results || results.length === 0) {
      return (
        <div className="text-center">
          <p className="mb-4 text-lg text-zinc-400">
            {t("no_result")}
          </p>
          <Button onClick={handleRestart}>{t("try_again")}</Button>
        </div>
      );
    }

    const sideEffects = getSideEffects(t);
    const randomSideEffect =
      sideEffects[Math.floor(Math.random() * sideEffects.length)];
    
    // 진단명 (현재 locale로 직접 번역)
    const diagnosisText = answers.mood?.id
      ? t(`diagnosis_${answers.mood.id}` as any)
      : t("diagnosis_funny");

    return (
      <div className="w-full max-w-6xl">
        <Card className="border-2 border-blue-500/50 bg-gradient-to-br from-zinc-900 to-zinc-950">
          <CardContent className="p-8">
            {/* 처방전 헤더 */}
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-bold text-white">
                📄 {t("prescription_title")}
              </h2>
              <p className="text-sm text-zinc-400">{t("prescription_subtitle")}</p>
            </div>

            {/* 진단명 */}
            <div className="mb-6 rounded-lg bg-blue-500/20 p-4">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                {t("diagnosis")}
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {t("diagnosis_text").replace("{diagnosis}", diagnosisText)}
              </p>
            </div>

            {/* 처방약 - 3개 그리드 */}
            <div className="mb-6">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
                {t("prescription")}
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {results.map((anime) => {
                  const posterUrl = tmdbClient.getPosterURL(anime.poster_path);
                  return (
                    <Card
                      key={anime.id}
                      className="group relative cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:bg-zinc-800"
                      onClick={() => router.push(ROUTES.ANIME.DETAIL(anime.id))}
                    >
                      <CardContent className="p-4">
                        <div className="relative mb-4 aspect-[2/3] w-full overflow-hidden rounded-xl">
                          <Image
                            src={posterUrl || "/images/placeholder-poster.svg"}
                            alt={anime.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                          {/* 찜하기 버튼 - 오버레이 */}
                          <div
                            className="absolute right-2 top-2 z-10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FavoriteButton
                              animeId={anime.id}
                              variant="icon"
                              size="sm"
                              className="bg-zinc-900/80 backdrop-blur-sm hover:bg-zinc-800/90"
                            />
                          </div>
                        </div>
                        <h3 className="mb-2 line-clamp-2 text-lg font-bold text-white">
                          {anime.name}
                        </h3>
                        {anime.overview && (
                          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                            {anime.overview}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400">⭐</span>
                            <span className="text-xs font-semibold text-white">
                              {anime.vote_average.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-500">
                            {anime.vote_count.toLocaleString()} {t("votes")}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* 부작용 */}
            <div className="mb-6 rounded-lg bg-rose-500/20 p-4">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-rose-400">
                {t("side_effects")}
              </p>
              <p className="text-sm text-rose-300">{randomSideEffect}</p>
            </div>

            {/* 액션 버튼 */}
            <div className="flex flex-col gap-4 md:flex-row">
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={handleRestart}
              >
                🔄 {t("try_again")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

