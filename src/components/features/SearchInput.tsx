"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "@/i18n/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/constants/routes";

export function SearchInput() {
  const t = useTranslations("search");
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`${ROUTES.SEARCH()}?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("placeholder")}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2 pl-10 pr-20 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-64"
      />
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="absolute right-1 top-1/2 -translate-y-1/2"
        disabled={!query.trim()}
      >
        {t("search")}
      </Button>
    </form>
  );
}





