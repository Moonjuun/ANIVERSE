import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { LoginModal } from "@/components/auth/login-modal";
import { ProfileSetupModal } from "@/components/auth/profile-setup-modal";
import { OnboardingModal } from "@/components/auth/onboarding-modal";
import { Header } from "@/components/layouts/Header";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastContainer } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/error-boundary";
import { AuthStateHandler } from "@/components/auth/auth-state-handler";
import { getOnboardingAnime } from "@/lib/tmdb/client";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  // 언어 매핑
  const languageMap: Record<string, string> = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
  };
  const language = languageMap[locale] || "ko-KR";

  // 온보딩용 애니메이션 데이터 가져오기
  const onboardingAnime = await getOnboardingAnime(language);

  return (
    <NextIntlClientProvider messages={messages}>
      <ErrorBoundary>
        <QueryProvider>
          <AuthStateHandler />
          <Header />
          {children}
          <LoginModal />
          <ProfileSetupModal />
          <OnboardingModal animeData={onboardingAnime} />
          <ToastContainer />
        </QueryProvider>
      </ErrorBoundary>
    </NextIntlClientProvider>
  );
}
