'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useModalStore } from '@/stores/useModalStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ROUTES } from '@/constants/routes';

export function LoginModal() {
  const t = useTranslations('auth.signup');
  const { loginModalOpen, setLoginModalOpen } = useModalStore();
  const { setUser } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);

  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err instanceof Error ? err.message : '소셜 로그인에 실패했습니다');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 회원가입 시 유효성 검사
    if (isSignUp) {
      if (!termsAgreed) {
        setError('이용약관 및 개인정보 처리방침에 동의해주세요');
        return;
      }

      if (password !== confirmPassword) {
        setError('비밀번호가 일치하지 않습니다');
        return;
      }

      if (password.length < 6) {
        setError('비밀번호는 6자 이상이어야 합니다');
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;
        
        if (data.user) {
          setUser(data.user);
          setLoginModalOpen(false);
          // 회원가입 성공 시 프로필 설정 모달로 이동
          const { setProfileSetupModalOpen } = useModalStore.getState();
          setProfileSetupModalOpen(true);
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        if (data.user) {
          setUser(data.user);
          setLoginModalOpen(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
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
          'relative w-full max-w-md rounded-xl bg-zinc-900 p-6 shadow-xl',
          'animate-in fade-in-0 zoom-in-95'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setLoginModalOpen(false)}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <h2 className="mb-2 text-2xl font-semibold text-white">
            {isSignUp ? '회원가입' : t('title')}
          </h2>
          <p className="text-sm text-zinc-400">
            {isSignUp ? '이메일로 계정을 만들어보세요' : t('subtitle')}
          </p>
        </div>

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
                  required
                  minLength={6}
                  placeholder="비밀번호 (6자 이상)"
                  className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                    <p className="mt-1 text-xs text-rose-500">비밀번호가 일치하지 않습니다</p>
                  )}
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-rose-500/20 px-4 py-2 text-sm text-rose-500">
                  {error}
                </div>
              )}
        </form>

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
                <span className="font-medium text-rose-500">(필수)</span>{' '}
                <Link
                  href={ROUTES.TERMS()}
                  className="font-medium text-blue-500 underline-offset-2 hover:underline"
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('terms_link')}
                </Link>
                {' 및 '}
                <Link
                  href={ROUTES.PRIVACY()}
                  className="font-medium text-blue-500 underline-offset-2 hover:underline"
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('privacy_link')}
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
                <span className="font-medium text-zinc-500">(선택)</span>{' '}
                {t('marketing_optional')}
              </span>
            </label>
          </div>
        )}

        {/* 회원가입/로그인 버튼 (맨 아래) */}
        <Button
          type="submit"
          form="email-form"
          className="mt-6 w-full"
          disabled={loading}
        >
          {loading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
        </Button>

        {/* OR 구분선 */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-zinc-700" />
          <span className="text-sm text-zinc-500">{t('or')}</span>
          <div className="h-px flex-1 bg-zinc-700" />
        </div>

        {/* 구글 로그인 버튼 */}
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {t('continue_with_google')}
        </Button>

        {/* 전환 링크 */}
        <div className="mt-4 flex items-center justify-center text-sm">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setConfirmPassword('');
            }}
            className="text-zinc-400 hover:text-blue-500 transition-colors"
          >
            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
          </button>
        </div>
      </div>
    </div>
  );
}

