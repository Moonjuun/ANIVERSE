import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { RecommendationWizard } from "@/components/features/RecommendationWizard";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "recommend" });

  const title = t("meta_title");
  const description = t("meta_description");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "ko" ? "ko_KR" : locale === "ja" ? "ja_JP" : "en_US",
      siteName: "AniVerse",
    },
  };
}

interface RecommendPageProps {
  params: Promise<{ locale: string }>;
}

export default async function RecommendPage({
  params,
}: RecommendPageProps) {
  const { locale } = await params;

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-12 md:px-6 lg:px-8">
        <RecommendationWizard locale={locale} />
      </div>
    </main>
  );
}

