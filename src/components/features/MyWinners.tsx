"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyWinners, type WorldCupWinner } from "@/actions/worldcup";
import { WORLD_CUP_THEMES } from "@/constants/worldcup";
import { Trophy } from "lucide-react";

export function MyWinners() {
  const t = useTranslations("worldcup");
  const [winners, setWinners] = useState<WorldCupWinner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWinners = async () => {
      const result = await getMyWinners();
      if (result.success && result.data) {
        setWinners(result.data);
      }
      setLoading(false);
    };

    loadWinners();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl bg-zinc-900 p-8 text-center">
        <p className="text-zinc-400">{t("loading")}</p>
      </div>
    );
  }

  if (winners.length === 0) {
    return (
      <div className="rounded-xl bg-zinc-900 p-8 text-center">
        <Trophy className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
        <p className="text-zinc-400">{t("no_winners")}</p>
      </div>
    );
  }

  const getThemeTitle = (worldcupId: string) => {
    const theme = WORLD_CUP_THEMES.find((t) => t.id === worldcupId);
    return theme?.title || worldcupId;
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold text-white">
        {t("hall_of_fame")} ({winners.length})
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {winners.map((winner) => (
          <Card key={winner.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-64 w-full">
                <Image
                  src={winner.character_image}
                  alt={winner.character_name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-zinc-900/80 text-white">
                    {getThemeTitle(winner.worldcup_id)}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="mb-1 text-lg font-bold text-white">
                  {winner.character_name}
                </h3>
                <p className="mb-2 text-sm text-zinc-400">{winner.ani_title}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(winner.created_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

