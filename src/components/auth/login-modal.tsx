"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useModalStore } from "@/stores/useModalStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/constants/routes";
import { checkEmailExists } from "@/actions/auth";

export function LoginModal() {
  const t = useTranslations("auth.signup");
  const { loginModalOpen, setLoginModalOpen } = useModalStore();
  const { setUser } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) throw oauthError;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "소셜 로그인에 실패했습니다"
      );
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("이메일을 입력해주세요");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 현재 locale 가져오기
      const pathSegments = window.location.pathname.split("/").filter(Boolean);
      const currentLocale =
        pathSegments[0] && ["ko", "en", "ja"].includes(pathSegments[0])
          ? pathSegments[0]
          : "ko";

      // Server Action을 통해 비밀번호 재설정 이메일 전송 (locale 정보 포함)
      const { resetPasswordForEmail } = await import("@/actions/auth");
      const result = await resetPasswordForEmail(email, currentLocale);

      if (!result.success) {
        throw new Error(
          result.error || "비밀번호 재설정 이메일 전송에 실패했습니다"
        );
      }

      setPasswordResetSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "비밀번호 재설정 이메일 전송에 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 회원가입 시 유효성 검사
    if (isSignUp) {
      if (!termsAgreed) {
        setError("이용약관 및 개인정보 처리방침에 동의해주세요");
        return;
      }

      if (password !== confirmPassword) {
        setError("비밀번호가 일치하지 않습니다");
        return;
      }

      if (password.length < 6) {
        setError("비밀번호는 6자 이상이어야 합니다");
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // 현재 locale 가져오기 (URL에서 추출)
        const pathSegments = window.location.pathname
          .split("/")
          .filter(Boolean);
        const currentLocale =
          pathSegments[0] && ["ko", "en", "ja"].includes(pathSegments[0])
            ? pathSegments[0]
            : "ko";

        // 먼저 이메일이 이미 존재하는지 확인
        const emailCheckResult = await checkEmailExists(email);
        if (emailCheckResult.success && emailCheckResult.exists) {
          setError(t("email_already_registered"));
          setLoading(false);
          return;
        }

        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/${currentLocale}/auth/confirm?next=/${currentLocale}`,
              data: {
                locale: currentLocale, // 이메일 템플릿에서 사용할 locale 정보
                marketing_agreed: marketingAgreed, // 마케팅 동의 정보 저장
              },
            },
          });

        if (signUpError) {
          // 중복 이메일 가입 방지: Supabase가 자동으로 처리하지만 사용자 친화적인 메시지 제공
          const errorMessage = signUpError.message?.toLowerCase() || "";
          if (
            errorMessage.includes("already registered") ||
            errorMessage.includes("user already exists") ||
            errorMessage.includes("email already") ||
            errorMessage.includes("already been registered") ||
            signUpError.status === 422
          ) {
            setError(t("email_already_registered"));
          } else if (
            errorMessage.includes("invalid email") ||
            errorMessage.includes("email format")
          ) {
            setError(t("invalid_email"));
          } else if (
            errorMessage.includes("password") &&
            errorMessage.includes("weak")
          ) {
            setError(t("weak_password"));
          } else {
            setError(signUpError.message || t("signup_failed"));
          }
          setLoading(false);
          return;
        }

        // signUp이 성공했지만 user가 없는 경우
        if (!signUpData.user) {
          setError(t("email_already_registered"));
          setLoading(false);
          return;
        }

        // 이미 이메일이 확인된 사용자인 경우 = 이미 가입된 이메일
        if (signUpData.user.email_confirmed_at) {
          setError(t("email_already_registered"));
          setLoading(false);
          return;
        }

        // signUp으로 반환된 사용자의 created_at을 확인하여 중복 가입 여부 판단
        // 이미 가입된 이메일인 경우, signUp이 성공하더라도 기존 사용자 정보가 반환되므로
        // created_at이 현재 시간과 멀리 떨어져 있음
        const userCreatedAt = new Date(signUpData.user.created_at);
        const now = new Date();
        const secondsSinceCreation =
          (now.getTime() - userCreatedAt.getTime()) / 1000;

        // 디버깅을 위한 로그 (개발 환경에서만)
        if (process.env.NODE_ENV === "development") {
          console.log("SignUp Debug:", {
            email,
            userId: signUpData.user.id,
            created_at: signUpData.user.created_at,
            email_confirmed_at: signUpData.user.email_confirmed_at,
            secondsSinceCreation,
            hasSession: !!signUpData.session,
          });
        }

        // 계정이 5초 이상 전에 생성된 경우 = 이미 가입된 이메일
        // (새로운 가입은 방금 생성되므로 created_at이 현재 시간과 매우 가까움)
        // 네트워크 지연 등을 고려하여 5초로 설정
        if (secondsSinceCreation > 5) {
          setError(t("email_already_registered"));
          setLoading(false);
          return;
        }

        // 이메일 인증이 필요한 경우 (새로운 가입)
        // data.user가 있고, session이 없고, email_confirmed_at이 없고, 계정이 방금 생성된 경우만
        if (
          signUpData.user &&
          !signUpData.session &&
          !signUpData.user.email_confirmed_at &&
          secondsSinceCreation <= 5
        ) {
          // 이메일 인증 메일이 발송됨
          setEmailSent(true);
          setLoginModalOpen(false);
          const { setEmailVerificationModalOpen, setEmailVerificationEmail } =
            useModalStore.getState();
          setEmailVerificationEmail(email);
          setEmailVerificationModalOpen(true);
          setLoading(false);
          return;
        }

        // 이메일 인증이 완료된 경우 (세션이 있는 경우)
        if (signUpData.user && signUpData.session) {
          setUser(signUpData.user);
          setLoginModalOpen(false);
          // 프로필 설정 모달로 이동
          const { setProfileSetupModalOpen } = useModalStore.getState();
          setProfileSetupModalOpen(true);
        }
      } else {
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) {
          // Supabase 에러 메시지를 다국어로 변환
          const errorMessage = signInError.message?.toLowerCase() || "";
          if (
            errorMessage.includes("invalid login credentials") ||
            errorMessage.includes("invalid credentials") ||
            errorMessage.includes("email not confirmed") ||
            signInError.status === 400
          ) {
            throw new Error(t("invalid_credentials"));
          } else if (errorMessage.includes("email")) {
            throw new Error(t("invalid_email"));
          } else {
            throw signInError;
          }
        }
        if (data.user) {
          setUser(data.user);
          setLoginModalOpen(false);
        }
      }
    } catch (err) {
      // 이미 번역된 메시지인지 확인
      const errorMessage = err instanceof Error ? err.message : "오류가 발생했습니다";
      // 번역 키가 아닌 경우 기본 에러 메시지 사용
      if (
        errorMessage.includes("invalid login credentials") ||
        errorMessage.includes("Invalid login credentials")
      ) {
        setError(t("invalid_credentials"));
      } else if (errorMessage === t("invalid_credentials") || errorMessage === t("invalid_email")) {
        // 이미 번역된 메시지
        setError(errorMessage);
      } else {
        setError(errorMessage || t("login_failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!loginModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={() => setLoginModalOpen(false)}
    >
      <div
        className={cn(
          "relative w-full max-w-md rounded-xl bg-zinc-900 p-6 shadow-xl",
          "animate-in fade-in-0 zoom-in-95"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            if (isPasswordReset) {
              setIsPasswordReset(false);
              setPasswordResetSent(false);
              setError(null);
            } else {
              setLoginModalOpen(false);
            }
          }}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {isPasswordReset && (
          <button
            onClick={() => {
              setIsPasswordReset(false);
              setPasswordResetSent(false);
              setError(null);
            }}
            className="absolute left-4 top-4 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">{t("back") || "뒤로"}</span>
          </button>
        )}

        <div className="mb-6 text-center">
          <h2 className="mb-2 text-2xl font-semibold text-white">
            {isPasswordReset
              ? t("reset_password_title") || "비밀번호 찾기"
              : isSignUp
              ? "회원가입"
              : t("title")}
          </h2>
          <p className="text-sm text-zinc-400">
            {isPasswordReset
              ? t("reset_password_subtitle") ||
                "이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다"
              : isSignUp
              ? "이메일로 계정을 만들어보세요"
              : t("subtitle")}
          </p>
        </div>

        {/* 비밀번호 찾기 화면 */}
        {isPasswordReset ? (
          <div className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePasswordReset();
              }}
              className="space-y-4"
            >
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t("email_placeholder") || "이메일 주소"}
                  className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={passwordResetSent || loading}
                />
              </div>

              {passwordResetSent && (
                <div className="rounded-lg bg-emerald-500/20 px-4 py-3 text-sm text-emerald-500">
                  <p className="font-medium mb-1">{t("password_reset_email_sent")}</p>
                  <p className="text-xs text-emerald-400">
                    {t("password_reset_instruction") ||
                      "이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정하세요."}
                  </p>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-rose-500/20 px-4 py-2 text-sm text-rose-500">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || passwordResetSent}
              >
                {loading
                  ? t("sending") || "전송 중..."
                  : passwordResetSent
                  ? t("password_reset_sent")
                  : t("send_reset_email") || "재설정 링크 보내기"}
              </Button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleSubmit} id="email-form" className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="이메일"
                className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isSignUp}
                minLength={6}
                placeholder="비밀번호 (6자 이상)"
                className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordReset(true);
                    setError(null);
                  }}
                  disabled={loading}
                  className="mt-2 text-xs text-blue-500 hover:text-blue-400 transition-colors disabled:text-zinc-600"
                >
                  {t("forgot_password")}
                </button>
              )}
            </div>

          {isSignUp && (
            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="비밀번호 확인"
                className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-rose-500">
                  비밀번호가 일치하지 않습니다
                </p>
              )}
            </div>
          )}

            {error && (
              <div className="rounded-lg bg-rose-500/20 px-4 py-2 text-sm text-rose-500">
                {error}
              </div>
            )}
          </form>
        )}

        {/* 약관 동의 */}
        {isSignUp && (
          <div className="mt-6 space-y-3">
            <label className="flex items-start gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 transition-colors hover:bg-zinc-800/70">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-zinc-600 bg-zinc-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-zinc-300">
                <span className="font-medium text-rose-500">(필수)</span>{" "}
                <Link
                  href={ROUTES.TERMS()}
                  className="font-medium text-blue-500 underline-offset-2 hover:underline"
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("terms_link")}
                </Link>
                {" 및 "}
                <Link
                  href={ROUTES.PRIVACY()}
                  className="font-medium text-blue-500 underline-offset-2 hover:underline"
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("privacy_link")}
                </Link>
                에 동의합니다
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4 transition-colors hover:bg-zinc-800/50">
              <input
                type="checkbox"
                checked={marketingAgreed}
                onChange={(e) => setMarketingAgreed(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-zinc-600 bg-zinc-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-zinc-400">
                <span className="font-medium text-zinc-500">(선택)</span>{" "}
                {t("marketing_optional")}
              </span>
            </label>
          </div>
        )}

        {/* 회원가입/로그인 버튼 (맨 아래) */}
        {!isPasswordReset && (
          <Button
            type="submit"
            form="email-form"
            className="mt-6 w-full"
            disabled={loading}
          >
            {loading ? "처리 중..." : isSignUp ? "회원가입" : "로그인"}
          </Button>
        )}

        {/* TODO: 구글 로그인 구현 후 주석 해제 */}
        {false && (
          <>
            {/* OR 구분선 */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-zinc-700" />
              <span className="text-sm text-zinc-500">{t("or")}</span>
              <div className="h-px flex-1 bg-zinc-700" />
            </div>

            {/* 구글 로그인 버튼 */}
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {t("continue_with_google")}
            </Button>
          </>
        )}

        {/* 전환 링크 */}
        {!isPasswordReset && (
          <div className="mt-4 flex items-center justify-center text-sm">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setConfirmPassword("");
              }}
              className="text-zinc-400 hover:text-blue-500 transition-colors"
            >
              {isSignUp
                ? "이미 계정이 있으신가요? 로그인"
                : "계정이 없으신가요? 회원가입"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
