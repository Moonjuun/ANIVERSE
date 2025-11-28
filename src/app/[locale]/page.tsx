import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <section className="flex min-h-[60vh] flex-col items-center justify-center gap-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            {t("hero_title")}
          </h1>
          <p className="max-w-2xl text-lg text-zinc-400 md:text-xl">
            {t("hero_subtitle")}
          </p>
        </section>
      </div>
    </main>
  );
}
