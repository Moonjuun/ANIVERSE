"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useModalStore } from "@/stores/useModalStore";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { routing } from "@/i18n/routing";
import { SearchInput } from "@/components/features/SearchInput";
import { ROUTES } from "@/constants/routes";

export function Header() {
  const t = useTranslations("header");
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const { setLoginModalOpen, setLogoutConfirmModalOpen } = useModalStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localeMenuOpen, setLocaleMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    const { setLogoutConfirmModalOpen } = useModalStore.getState();
    setLogoutConfirmModalOpen(true);
  };

  const handleLocaleChange = (locale: string) => {
    router.replace(pathname, { locale });
    setLocaleMenuOpen(false);
  };

  const navItems = [
    { href: "/", label: t("home") },
    { href: "/anime", label: t("anime") },
    { href: "/reviews", label: t("reviews") },
    { href: ROUTES.RECOMMEND(), label: t("recommend") },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "border-zinc-800 bg-zinc-950/90 backdrop-blur-md"
          : "border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-white">AniVerse</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors duration-200",
                pathname === item.href
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
          <SearchInput />
        </div>

        {/* Right Side Actions */}
        <div className="hidden items-center space-x-4 md:flex">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLocaleMenuOpen(!localeMenuOpen)}
              className="flex items-center space-x-1 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors duration-200 hover:bg-zinc-800 hover:text-white"
            >
              <Globe className="h-4 w-4" />
              <span>{t("language")}</span>
            </button>

            {localeMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLocaleMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-32 rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl">
                  {routing.locales.map((locale) => (
                    <button
                      key={locale}
                      onClick={() => handleLocaleChange(locale)}
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg",
                        "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      )}
                    >
                      {locale.toUpperCase()}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="text-sm text-zinc-400 transition-colors duration-200 hover:text-white"
              >
                {t("profile")}
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                {t("logout")}
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setLoginModalOpen(true)}
            >
              {t("login")}
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-zinc-400 transition-colors duration-200 hover:bg-zinc-800 hover:text-white md:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-800 bg-zinc-950 md:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200",
                  pathname === item.href
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Language Selector */}
            <div className="border-t border-zinc-800 pt-4">
              <div className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t("language")}
              </div>
              {routing.locales.map((locale) => (
                <button
                  key={locale}
                  onClick={() => {
                    handleLocaleChange(locale);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full rounded-lg px-4 py-2 text-left text-sm text-zinc-400 transition-colors duration-200 hover:bg-zinc-800 hover:text-white"
                >
                  {locale.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Mobile Auth */}
            <div className="border-t border-zinc-800 pt-4">
              {user ? (
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg px-4 py-2 text-sm text-zinc-400 transition-colors duration-200 hover:bg-zinc-800 hover:text-white"
                  >
                    {t("profile")}
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    {t("logout")}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setLoginModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  {t("login")}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

