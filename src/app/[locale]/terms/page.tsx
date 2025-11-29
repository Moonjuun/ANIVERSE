import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  const t = await getTranslations("terms");

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
        {/* 서비스 개요 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            {t("sections.overview.title")}
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            {t("sections.overview.content")}
          </p>
          <ul className="ml-6 list-disc space-y-2 text-zinc-400">
            <li>{t("sections.overview.login")}</li>
            <li>{t("sections.overview.independent")}</li>
          </ul>
        </section>

        {/* 이용자의 의무 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            {t("sections.user_obligations.title")}
          </h2>
          <ul className="ml-6 list-disc space-y-2 text-zinc-400">
            <li>{t("sections.user_obligations.account")}</li>
            <li>{t("sections.user_obligations.prohibited")}</li>
          </ul>
        </section>

        {/* 금지 행위 예시 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            {t("sections.prohibited_acts.title")}
          </h2>
          <ul className="ml-6 list-disc space-y-2 text-zinc-400">
            <li>{t("sections.prohibited_acts.illegal")}</li>
            <li>{t("sections.prohibited_acts.advertising")}</li>
            <li>{t("sections.prohibited_acts.automation")}</li>
          </ul>
        </section>

        {/* 서비스 변경 및 중단 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            {t("sections.service_changes.title")}
          </h2>
          <ul className="ml-6 list-disc space-y-2 text-zinc-400">
            <li>{t("sections.service_changes.changes")}</li>
            <li>{t("sections.service_changes.termination")}</li>
          </ul>
        </section>

        {/* 책임의 한계 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            {t("sections.liability.title")}
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            {t("sections.liability.content")}
          </p>
        </section>

        {/* 지적 재산권 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            {t("sections.intellectual_property.title")}
          </h2>
          <ul className="ml-6 list-disc space-y-2 text-zinc-400">
            <li>{t("sections.intellectual_property.rights")}</li>
            <li>{t("sections.intellectual_property.prohibition")}</li>
          </ul>
        </section>

        {/* 준거법 및 관할 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            {t("sections.governing_law.title")}
          </h2>
          <ul className="ml-6 list-disc space-y-2 text-zinc-400">
            <li>{t("sections.governing_law.law")}</li>
            <li>{t("sections.governing_law.disputes")}</li>
          </ul>
        </section>

        {/* 부칙 */}
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

