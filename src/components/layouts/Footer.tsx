"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils/cn";

export function Footer() {
  const t = useTranslations("footer");

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: ROUTES.ANIME.LIST(), label: t("anime") },
    { href: ROUTES.REVIEWS.LIST(), label: t("reviews") },
  ];

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <Link href={ROUTES.HOME()} className="inline-block">
              <h3 className="text-2xl font-bold text-white">AniVerse</h3>
            </Link>
            <p className="text-sm leading-relaxed text-zinc-400">
              {t("description")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              {t("quick_links")}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              {t("legal")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href={ROUTES.TERMS()}
                  className="text-sm text-zinc-400 transition-colors duration-200 hover:text-white"
                >
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.PRIVACY()}
                  className="text-sm text-zinc-400 transition-colors duration-200 hover:text-white"
                >
                  {t("privacy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              {t("about")}
            </h4>
            <p className="text-sm leading-relaxed text-zinc-400">
              {t("about_description")}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-zinc-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-zinc-500">
              © {currentYear} AniVerse. {t("rights_reserved")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-600">
              <span>
                {t("powered_by")} <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">TMDB API</a>
              </span>
              <span className="text-zinc-700">•</span>
              <span>
                <a href="https://anilist.co/" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">AniList API</a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

