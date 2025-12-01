"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/constants/routes";

export default function ResetPasswordPage() {
  const t = useTranslations("auth.reset_password");
  const router = useRouter();
  const supabase = createClient();
  const { setUser } = useAuthStore();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    // 세션이 있는지 확인 (비밀번호 재설정 토큰이 유효한지 확인)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsValidToken(false);
        setError(t("invalid_token") || "유효하지 않은 링크이거나 만료되었습니다.");
      } else {
        setIsValidToken(true);
      }
    };
    checkSession();
  }, [supabase, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(t("password_min_length"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("password_mismatch"));
      return;
    }

    setLoading(true);

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        // Supabase 에러 메시지를 다국어로 변환
        const errorMessage = updateError.message?.toLowerCase() || "";
        if (
          errorMessage.includes("new password should be different") ||
          errorMessage.includes("same as old password") ||
          errorMessage.includes("different from the old")
        ) {
          throw new Error(t("password_same_as_old"));
        } else if (errorMessage.includes("password") && errorMessage.includes("weak")) {
          throw new Error(t("weak_password"));
        } else {
          throw updateError;
        }
      }

      if (data.user) {
        setUser(data.user);
        setSuccess(true);
        // 2초 후 홈으로 리다이렉트
        setTimeout(() => {
          router.push(ROUTES.HOME());
        }, 2000);
      }
    } catch (err) {
      // 이미 번역된 메시지인지 확인
      const errorMessage = err instanceof Error ? err.message : t("update_failed");
      if (
        errorMessage.includes("New password should be different") ||
        errorMessage.includes("new password should be different")
      ) {
        setError(t("password_same_as_old"));
      } else if (errorMessage === t("password_same_as_old") || errorMessage === t("weak_password")) {
        // 이미 번역된 메시지
        setError(errorMessage);
      } else {
        setError(errorMessage || t("update_failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  if (isValidToken === false) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-4 text-2xl font-semibold text-white">
            {t("error_title") || "오류"}
          </h1>
          <p className="mb-6 text-zinc-400">
            {error || t("invalid_token") || "유효하지 않은 링크이거나 만료되었습니다."}
          </p>
          <Link href={ROUTES.HOME()}>
            <Button>{t("go_home")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-4 text-2xl font-semibold text-white">
            {t("success_title")}
          </h1>
          <p className="mb-6 text-zinc-400">{t("success_message")}</p>
          <Link href={ROUTES.HOME()}>
            <Button>{t("go_home")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isValidToken === null) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <p className="text-zinc-400">{t("loading") || "로딩 중..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-zinc-900 p-6 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-semibold text-white">
            {t("title")}
          </h1>
          <p className="text-sm text-zinc-400">{t("subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder={t("password_placeholder")}
              className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder={t("confirm_password_placeholder")}
              className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-xs text-rose-500">
                {t("password_mismatch")}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-rose-500/20 px-4 py-2 text-sm text-rose-500">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("updating") : t("update_password")}
          </Button>
        </form>
      </div>
    </div>
  );
}

