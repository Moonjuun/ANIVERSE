"use client";

import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/constants/routes";
import { useTranslations } from "next-intl";

interface Mood {
  id: string;
  emoji: string;
  genreId: number; // TMDB 장르 ID
}

// TMDB 장르 ID 매핑
// 18: Drama, 28: Action, 16: Animation, 35: Comedy, 10751: Family
const moods: Mood[] = [
  { id: "depressed", emoji: "💊", genreId: 18 }, // 우울할 때 -> Drama
  { id: "action", emoji: "🔥", genreId: 28 }, // 액션 쾌감 -> Action
  { id: "brain", emoji: "🧠", genreId: 16 }, // 뇌 빼기 -> Animation (추가 필터링 필요)
  { id: "touching", emoji: "😭", genreId: 18 }, // 감동 실화 -> Drama
  { id: "funny", emoji: "😂", genreId: 35 }, // 웃고 싶을 때 -> Comedy
];

export function MoodPick() {
  const t = useTranslations("home.mood_pick");

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
      <h2 className="mb-6 text-2xl font-semibold text-white md:text-3xl">
        {t("title")}
      </h2>
      <div className="flex flex-wrap gap-4">
        {moods.map((mood) => (
          <Link
            key={mood.id}
            href={`${ROUTES.ANIME.LIST()}?genre=${mood.genreId}`}
            className="group flex items-center gap-3 rounded-xl bg-zinc-900 px-6 py-4 transition-all duration-300 hover:bg-zinc-800 hover:scale-[1.02]"
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-base font-medium text-white md:text-lg">
              {t(mood.id)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

