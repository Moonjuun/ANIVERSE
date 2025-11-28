import type { Metadata } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import "../globals.css";
import { LoginModal } from "@/components/auth/login-modal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const pretendard = Noto_Sans_KR({
  variable: "--font-pretendard",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | AniVerse",
    default: "AniVerse",
  },
  description: "애니메이션 리뷰와 추천을 한 곳에서",
};

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <LoginModal />
    </>
  );
}
