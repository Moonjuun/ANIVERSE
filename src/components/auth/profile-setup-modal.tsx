"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useModalStore } from "@/stores/useModalStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Dice6 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useTranslations } from "next-intl";
import { generateRandomNickname } from "@/lib/utils/nickname-generator";
import { AVATARS, type AvatarId } from "@/lib/utils/avatars";
import { updateProfile } from "@/actions/profile";
import { useToast } from "@/lib/utils/toast";

export function ProfileSetupModal() {
  const t = useTranslations("auth.profile_setup");
  const { profileSetupModalOpen, setProfileSetupModalOpen } = useModalStore();
  const { user, setUser } = useAuthStore();
  const [nickname, setNickname] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>(AVATARS[0].id);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const supabase = createClient();

  const handleGenerateRandom = () => {
    setNickname(generateRandomNickname());
  };

  const handlePrevAvatar = () => {
    setAvatarIndex((prev) => (prev === 0 ? AVATARS.length - 1 : prev - 1));
    setSelectedAvatar(
      AVATARS[avatarIndex === 0 ? AVATARS.length - 1 : avatarIndex - 1].id
    );
  };

  const handleNextAvatar = () => {
    setAvatarIndex((prev) => (prev === AVATARS.length - 1 ? 0 : prev + 1));
    setSelectedAvatar(
      AVATARS[avatarIndex === AVATARS.length - 1 ? 0 : avatarIndex + 1].id
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요");
      return;
    }

    if (!user) {
      setError("로그인이 필요합니다");
      return;
    }

    setLoading(true);

    try {
      // user_metadata에서 마케팅 동의 정보 가져오기
      const marketingAgreed =
        (user.user_metadata?.marketing_agreed as boolean) || false;

      // 프로필 생성/업데이트
      const result = await updateProfile({
        username: nickname.trim(),
        avatar_url: `emoji:${selectedAvatar}`,
        marketing_agreed: marketingAgreed,
      });

      if (!result.success) {
        throw new Error(result.error || t("error"));
      }

      // 프로필 설정 완료
      setProfileSetupModalOpen(false);
      toast.success("프로필이 설정되었습니다");

      // 찜하기가 없으면 온보딩 모달 열기
      const { getFavorites } = await import("@/actions/favorite");
      const favoritesResult = await getFavorites();
      const hasFavorites =
        favoritesResult.success && favoritesResult.data.length > 0;

      if (!hasFavorites) {
        const { setOnboardingModalOpen } = useModalStore.getState();
        // 약간의 딜레이를 주어 프로필 설정 모달이 닫힌 후 열림
        setTimeout(() => {
          setOnboardingModalOpen(true);
        }, 300);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  };

  if (!profileSetupModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={() => setProfileSetupModalOpen(false)}
    >
      <div
        className={cn(
          "relative w-full max-w-md rounded-xl bg-zinc-900 p-6 shadow-xl",
          "animate-in fade-in-0 zoom-in-95"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setProfileSetupModalOpen(false)}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <h2 className="mb-1 text-2xl font-semibold text-white">
            {t("title")}
          </h2>
          <p className="text-sm text-zinc-400">{t("subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 아바타 선택 */}
          <div>
            <label className="mb-3 block text-sm font-medium text-white">
              {t("avatar")}
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handlePrevAvatar}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex gap-2">
                {AVATARS.map((avatar, idx) => {
                  const isSelected = avatar.id === selectedAvatar;
                  // 현재 인덱스 기준으로 앞뒤 2개씩 표시 (최대 5개)
                  const distance = Math.min(
                    Math.abs(idx - avatarIndex),
                    AVATARS.length - Math.abs(idx - avatarIndex)
                  );
                  const isVisible = distance <= 2;

                  if (!isVisible) return null;

                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(avatar.id);
                        setAvatarIndex(idx);
                      }}
                      className={cn(
                        "flex h-16 w-16 items-center justify-center rounded-full text-3xl transition-all",
                        isSelected
                          ? "scale-110 border-2 border-blue-500 bg-zinc-800"
                          : "border-2 border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                      )}
                    >
                      {avatar.emoji}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleNextAvatar}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 닉네임 입력 */}
          <div>
            <label
              htmlFor="nickname"
              className="mb-2 block text-sm font-medium text-white"
            >
              {t("nickname")}
            </label>
            <div className="flex gap-2">
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={t("nickname_placeholder")}
                className="flex-1 rounded-lg bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={3}
                maxLength={20}
              />
              <button
                type="button"
                onClick={handleGenerateRandom}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                title={t("generate_random")}
              >
                <Dice6 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 지역 표시 (자동 감지) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              {t("locale")}
            </label>
            <div className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-400">
              🇰🇷 한국 ({t("locale_auto")})
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-rose-500/20 px-4 py-2 text-sm text-rose-500">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("submitting") : `${t("start")} 🚀`}
          </Button>
        </form>
      </div>
    </div>
  );
}
