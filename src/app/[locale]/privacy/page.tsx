import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  const t = await getTranslations("privacy");

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {t("last_updated")}:{" "}
          {locale === "ko"
            ? "2025년 1월 1일"
            : locale === "ja"
            ? "2025年1月1日"
            : "January 1, 2025"}
        </p>
      </div>

      <div className="space-y-8 rounded-xl bg-zinc-900 p-6 md:p-8">
        {/* 소개 */}
        <section className="space-y-4">
          <p className="text-zinc-400 leading-relaxed">{t("intro")}</p>
        </section>

        {/* 수집하는 개인정보 항목 및 수집 방법 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            {t("sections.collection.title")}
          </h2>
          <ul className="ml-6 list-disc space-y-2 text-zinc-400">
            <li>{t("sections.collection.items")}</li>
            <li>{t("sections.collection.method")}</li>
          </ul>
        </section>

        {/* 개인정보의 이용 목적 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            {t("sections.purpose.title")}
          </h2>
          <ul className="ml-6 list-disc space-y-2 text-zinc-400">
            <li>{t("sections.purpose.identification")}</li>
            <li>{t("sections.purpose.service")}</li>
            <li>{t("sections.purpose.notifications")}</li>
          </ul>
        </section>

        {/* 개인정보 보유 및 이용 기간 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            {t("sections.retention.title")}
          </h2>
          <ul className="ml-6 list-disc space-y-2 text-zinc-400">
            <li>{t("sections.retention.period")}</li>
            <li>{t("sections.retention.deletion")}</li>
          </ul>
        </section>

        {/* 개인정보의 제3자 제공 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            {t("sections.third_party.title")}
          </h2>
          <ul className="ml-6 list-disc space-y-2 text-zinc-400">
            <li>{t("sections.third_party.no_sharing")}</li>
            <li>{t("sections.third_party.exception")}</li>
          </ul>
        </section>

        {/* 개인정보처리 위탁 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            {t("sections.entrustment.title")}
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            {t("sections.entrustment.none")}
          </p>
        </section>

        {/* 자동 수집 정보 및 쿠키 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            {t("sections.cookies.title")}
          </h2>
          <ul className="ml-6 list-disc space-y-2 text-zinc-400">
            <li>{t("sections.cookies.usage")}</li>
            <li>{t("sections.cookies.blocking")}</li>
          </ul>
        </section>

        {/* 이용자의 권리와 행사 방법 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            {t("sections.rights.title")}
          </h2>
          <ul className="ml-6 list-disc space-y-2 text-zinc-400">
            <li>{t("sections.rights.access")}</li>
            <li>{t("sections.rights.contact")}</li>
          </ul>
        </section>

        {/* 개인정보 보호책임자 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            {t("sections.officer.title")}
          </h2>
          <ul className="ml-6 list-disc space-y-2 text-zinc-400">
            <li>{t("sections.officer.officer")}</li>
            <li>{t("sections.officer.email")}</li>
          </ul>
        </section>

        {/* 정책 변경 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            {t("sections.effective_date.title")}
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            {t("sections.effective_date.date")}
          </p>
        </section>
      </div>
    </main>
  );
}
