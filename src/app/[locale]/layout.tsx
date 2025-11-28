import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { LoginModal } from "@/components/auth/login-modal";
import { Header } from "@/components/layouts/Header";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastContainer } from "@/components/ui/toast";

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

  return (
    <NextIntlClientProvider messages={messages}>
      <QueryProvider>
        <Header />
        {children}
        <LoginModal />
        <ToastContainer />
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
