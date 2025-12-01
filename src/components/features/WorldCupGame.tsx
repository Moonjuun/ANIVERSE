"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WORLD_CUP_THEMES, WORLD_CUP_ROUNDS, GENDER_OPTIONS } from "@/constants/worldcup";
import { anilistClient } from "@/lib/anilist/client";
import { saveWinner, type CharacterData } from "@/actions/worldcup";
import { useAuthStore } from "@/stores/useAuthStore";
import { useModalStore } from "@/stores/useModalStore";
import { Trophy, Copy, Check } from "lucide-react";

type GameStep = "welcome" | "options" | "playing" | "finished";

interface Character {
  id: number;
  name: string;
  image: string;
  aniTitle: string;
}

interface GameState {
  theme: (typeof WORLD_CUP_THEMES)[number] | null;
  gender: "Male" | "Female" | undefined;
  round: number;
  candidates: Character[];
  currentRound: number;
  winners: Character[];
  isSaving: boolean;
  isSaved: boolean;
}

export function WorldCupGame() {
  const t = useTranslations("worldcup");
  const { user } = useAuthStore();
  const { setLoginModalOpen } = useModalStore();
  const [step, setStep] = useState<GameStep>("welcome");
  const [gameState, setGameState] = useState<GameState>({
    theme: WORLD_CUP_THEMES[0], // 전체 캐릭터 월드컵
    gender: undefined,
    round: 16,
    candidates: [],
    currentRound: 0,
    winners: [],
    isSaving: false,
    isSaved: false,
  });
  const [currentMatch, setCurrentMatch] = useState<[Character, Character] | null>(null);
  const [winner, setWinner] = useState<Character | null>(null);
  const [copied, setCopied] = useState(false);

  // 후보 로딩
  const loadCandidates = async () => {
    if (!gameState.theme) return;

    try {
      const results = await anilistClient.getWorldCupCandidates({
        count: gameState.round,
        gender: gameState.gender,
        mediaId: gameState.theme.mediaId,
      });

      if (results.length === 0) {
        console.error("No candidates found");
        // TODO: 에러 메시지 표시
        return;
      }

      const candidates: Character[] = results.map((char) => ({
        id: char.id,
        name: char.name.full,
        image: char.image.large,
        aniTitle: char.media.nodes[0]?.title.userPreferred || "Unknown",
      }));

      setGameState((prev) => ({ ...prev, candidates }));
      setStep("playing");
      startGame(candidates);
    } catch (error) {
      console.error("Failed to load candidates:", error);
      // TODO: 사용자에게 에러 메시지 표시
    }
  };

  // 게임 시작
  const startGame = (candidates: Character[]) => {
    setGameState((prev) => ({
      ...prev,
      currentRound: candidates.length,
      winners: [],
      candidates,
    }));
    if (candidates.length >= 2) {
      setCurrentMatch([candidates[0], candidates[1]]);
    }
  };

  // 승자 선택
  const selectWinner = (selected: Character) => {
    const [left, right] = currentMatch!;
    const loser = selected.id === left.id ? right : left;

    // 승자를 winners에 추가하고, 패자는 제거
    const newWinners = [...gameState.winners, selected];
    const remainingCandidates = gameState.candidates.filter(
      (c) => c.id !== selected.id && c.id !== loser.id
    );

    // 다음 라운드로 진행
    if (remainingCandidates.length === 0 && newWinners.length === 1) {
      // 우승자 결정
      setWinner(newWinners[0]);
      setStep("finished");
    } else if (remainingCandidates.length === 0) {
      // 현재 라운드가 끝났고, 다음 라운드로
      if (newWinners.length === 1) {
        setWinner(newWinners[0]);
        setStep("finished");
      } else {
        // 다음 라운드 시작
        setGameState((prev) => ({
          ...prev,
          candidates: newWinners,
          winners: [],
        }));
        if (newWinners.length >= 2) {
          setCurrentMatch([newWinners[0], newWinners[1]]);
        }
      }
    } else {
      // 같은 라운드 계속
      setGameState((prev) => ({
        ...prev,
        winners: newWinners,
        candidates: remainingCandidates,
      }));
      if (remainingCandidates.length >= 2) {
        setCurrentMatch([remainingCandidates[0], remainingCandidates[1]]);
      } else if (remainingCandidates.length === 1 && newWinners.length > 0) {
        // 마지막 후보와 승자 대결
        setCurrentMatch([newWinners[newWinners.length - 1], remainingCandidates[0]]);
      }
    }
  };

  // 결과 저장
  const handleSave = async () => {
    if (!user) {
      setLoginModalOpen(true);
      return;
    }

    if (!winner || !gameState.theme) return;

    setGameState((prev) => ({ ...prev, isSaving: true }));

    const characterData: CharacterData = {
      id: winner.id,
      name: winner.name,
      image: winner.image,
      aniTitle: winner.aniTitle,
    };

    const result = await saveWinner(gameState.theme.id, characterData);

    if (result.success) {
      setGameState((prev) => ({ ...prev, isSaving: false, isSaved: true }));
    } else {
      setGameState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  // 공유 텍스트 복사
  const handleShare = async () => {
    if (!winner) return;

    const text = `내 최애는 ${winner.name}! #AniVerse`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 현재 라운드 계산
  const getCurrentRoundLabel = (): string => {
    const totalRemaining = gameState.candidates.length + gameState.winners.length;
    const initialRound = gameState.round;
    
    // 32강 시작인 경우
    if (initialRound === 32) {
      if (totalRemaining >= 32) return "32강";
      if (totalRemaining >= 16) return "16강";
      if (totalRemaining >= 8) return "8강";
      if (totalRemaining >= 4) return "4강";
      if (totalRemaining >= 2) return "준결승";
      if (totalRemaining === 1) return "결승";
    }
    
    // 16강 시작인 경우
    if (initialRound === 16) {
      if (totalRemaining >= 16) return "16강";
      if (totalRemaining >= 8) return "8강";
      if (totalRemaining >= 4) return "4강";
      if (totalRemaining >= 2) return "준결승";
      if (totalRemaining === 1) return "결승";
    }
    
    return "16강";
  };

  // 진행률 계산 (더 정확하게)
  const getProgress = () => {
    const totalRemaining = gameState.candidates.length + gameState.winners.length;
    const totalMatches = gameState.round - 1; // 전체 대결 수 (16강 = 15번, 32강 = 31번)
    const completedMatches = gameState.round - totalRemaining; // 완료된 대결 수
    const currentMatch = completedMatches + 1; // 현재 대결 번호
    
    return {
      current: currentMatch,
      total: totalMatches,
      percentage: totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0,
    };
  };

  const progress = getProgress();

  // Step 0: 시작 화면
  if (step === "welcome") {
    return (
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
          🏆 {t("welcome_title")}
        </h1>
        <p className="mb-8 text-lg text-zinc-400 md:text-xl">
          {t("welcome_subtitle")}
        </p>
        <Button size="lg" onClick={() => setStep("options")}>
          {t("start_button")}
        </Button>
      </div>
    );
  }

  // Step 1: 옵션 설정
  if (step === "options") {
    return (
      <div className="w-full max-w-4xl text-center">
        <div className="space-y-8">
          {/* 성별 선택 */}
          <div>
            <div className="flex flex-wrap justify-center gap-4">
              {GENDER_OPTIONS.map((option) => (
                <Button
                  key={option.id || "all"}
                  variant={gameState.gender === option.id ? "primary" : "secondary"}
                  size="lg"
                  onClick={() =>
                    setGameState((prev) => ({ ...prev, gender: option.id }))
                  }
                >
                  <span className="mr-2">{option.emoji}</span>
                  {t(option.labelKey)}
                </Button>
              ))}
            </div>
          </div>

          {/* 강수 선택 */}
          <div>
            <div className="flex flex-wrap justify-center gap-4">
              {WORLD_CUP_ROUNDS.map((round) => (
                <Button
                  key={round.id}
                  variant={gameState.round === round.id ? "primary" : "secondary"}
                  size="lg"
                  onClick={() => setGameState((prev) => ({ ...prev, round: round.id }))}
                >
                  {round.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 시작 버튼 */}
          <div className="flex justify-center">
            <Button size="lg" onClick={loadCandidates}>
              {t("start_game")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: 게임 진행
  if (step === "playing" && currentMatch) {
    const [left, right] = currentMatch;

    return (
      <div className="w-full max-w-7xl">
        {/* 진행바 */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm text-zinc-400">
            <span className="font-semibold text-white">{getCurrentRoundLabel()}</span>
            <span>
              {progress.current} / {progress.total}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* VS 배지 */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="absolute z-10 rounded-full bg-zinc-900 px-6 py-3 text-2xl font-bold text-white shadow-lg">
            VS
          </div>
        </div>

        {/* 캐릭터 대결 */}
        <div className="grid grid-cols-2 gap-4 md:gap-8">
          {/* 왼쪽 캐릭터 */}
          <Card
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-zinc-800"
            onClick={() => selectWinner(left)}
          >
            <CardContent className="p-0">
              <div className="relative h-[60vh] w-full overflow-hidden rounded-xl">
                <Image
                  src={left.image}
                  alt={left.name}
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
                <div className="absolute right-4 top-4 z-10">
                  <Badge variant="secondary" className="text-sm font-bold">
                    {getCurrentRoundLabel()}
                  </Badge>
                </div>
              </div>
              <div className="p-4 text-center">
                <h3 className="text-xl font-bold text-white">{left.name}</h3>
                <p className="text-sm text-zinc-400">{left.aniTitle}</p>
              </div>
            </CardContent>
          </Card>

          {/* 오른쪽 캐릭터 */}
          <Card
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-zinc-800"
            onClick={() => selectWinner(right)}
          >
            <CardContent className="p-0">
              <div className="relative h-[60vh] w-full overflow-hidden rounded-xl">
                <Image
                  src={right.image}
                  alt={right.name}
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
                <div className="absolute right-4 top-4 z-10">
                  <Badge variant="secondary" className="text-sm font-bold">
                    {getCurrentRoundLabel()}
                  </Badge>
                </div>
              </div>
              <div className="p-4 text-center">
                <h3 className="text-xl font-bold text-white">{right.name}</h3>
                <p className="text-sm text-zinc-400">{right.aniTitle}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 4: 결과
  if (step === "finished" && winner) {
    return (
      <div className="w-full max-w-4xl">
        <Card className="border-2 border-yellow-500/50 bg-gradient-to-br from-zinc-900 to-zinc-950">
          <CardContent className="p-8">
            <div className="mb-8 text-center">
              <div className="mb-4 text-6xl">🏆</div>
              <h2 className="mb-2 text-3xl font-bold text-white md:text-4xl">
                {t("winner_title")}
              </h2>
              <p className="text-zinc-400">{t("winner_subtitle")}</p>
            </div>

            {/* 우승자 */}
            <div className="mb-8">
              <div className="relative mx-auto h-96 w-64 overflow-hidden rounded-xl">
                <Image
                  src={winner.image}
                  alt={winner.name}
                  fill
                  className="object-cover"
                  sizes="256px"
                />
              </div>
              <div className="mt-6 text-center">
                <h3 className="mb-2 text-3xl font-bold text-white">{winner.name}</h3>
                <p className="text-lg text-zinc-400">{winner.aniTitle}</p>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex flex-col gap-4 md:flex-row">
              {user ? (
                gameState.isSaved ? (
                  <Button size="lg" className="flex-1" disabled>
                    <Check className="mr-2 h-5 w-5" />
                    {t("saved")}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={handleSave}
                    disabled={gameState.isSaving}
                  >
                    <Trophy className="mr-2 h-5 w-5" />
                    {gameState.isSaving ? t("saving") : t("save_result")}
                  </Button>
                )
              ) : (
                <Button size="lg" className="flex-1" onClick={() => setLoginModalOpen(true)}>
                  <Trophy className="mr-2 h-5 w-5" />
                  {t("login_to_save")}
                </Button>
              )}

              <Button
                size="lg"
                variant="secondary"
                className="flex-1"
                onClick={handleShare}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    {t("copied")}
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-5 w-5" />
                    {t("share")}
                  </>
                )}
              </Button>

              <Button
                size="lg"
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setStep("welcome");
                  setGameState({
                    theme: WORLD_CUP_THEMES[0],
                    gender: undefined,
                    round: 16,
                    candidates: [],
                    currentRound: 0,
                    winners: [],
                    isSaving: false,
                    isSaved: false,
                  });
                  setWinner(null);
                  setCurrentMatch(null);
                }}
              >
                🔄 {t("play_again")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

