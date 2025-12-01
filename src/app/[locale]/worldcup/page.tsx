import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { WorldCupGame } from "@/components/features/WorldCupGame";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "worldcup" });

  const title = t("welcome_title");
  const description = t("welcome_subtitle");

  return {
    title: `${title} - AniVerse`,
    description,
    openGraph: {
      title: `${title} - AniVerse`,
      description,
      type: "website",
      locale: locale === "ko" ? "ko_KR" : locale === "ja" ? "ja_JP" : "en_US",
      siteName: "AniVerse",
    },
  };
}

interface WorldCupPageProps {
  params: Promise<{ locale: string }>;
}

export default async function WorldCupPage({ params }: WorldCupPageProps) {
  const { locale } = await params;

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-12 md:px-6 lg:px-8">
        <WorldCupGame />
      </div>
    </main>
  );
}

