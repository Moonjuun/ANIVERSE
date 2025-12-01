"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { RecommendationWizard } from "./RecommendationWizard";
import { WorldCupGame } from "./WorldCupGame";
import { Button } from "@/components/ui/button";

interface RecommendTabsProps {
  locale: string;
}

type Tab = "recommend" | "worldcup";

export function RecommendTabs({ locale }: RecommendTabsProps) {
  const t = useTranslations("recommend");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>(
    (searchParams.get("tab") as Tab) || "recommend"
  );

  useEffect(() => {
    const tab = searchParams.get("tab") as Tab;
    if (tab === "worldcup" || tab === "recommend") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "recommend") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full">
      {/* 탭 버튼 */}
      <div className="mb-8 flex justify-center gap-4">
        <Button
          variant={activeTab === "recommend" ? "primary" : "secondary"}
          size="lg"
          onClick={() => handleTabChange("recommend")}
        >
          🧪 {t("welcome_title")}
        </Button>
        <Button
          variant={activeTab === "worldcup" ? "primary" : "secondary"}
          size="lg"
          onClick={() => handleTabChange("worldcup")}
        >
          🏆 캐릭터 이상형 월드컵
        </Button>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="flex items-center justify-center">
        {activeTab === "recommend" ? (
          <RecommendationWizard locale={locale} />
        ) : (
          <WorldCupGame />
        )}
      </div>
    </div>
  );
}

