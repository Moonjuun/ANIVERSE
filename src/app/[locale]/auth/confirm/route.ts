import { type EmailOtpType } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { routing } from '@/i18n/routing';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? `/${locale}`;

  if (!token_hash || !type) {
    // 토큰이 없으면 에러 페이지로 리다이렉트
    return NextResponse.redirect(new URL(`/${locale}/auth/error`, request.url));
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error) {
      console.error('Email verification error:', error);
      return NextResponse.redirect(new URL(`/${locale}/auth/error`, request.url));
    }

    // 인증 성공 시 지정된 URL로 리다이렉트 (또는 홈으로)
    const redirectUrl = new URL(next, request.url);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Unexpected error during email verification:', error);
    return NextResponse.redirect(new URL(`/${locale}/auth/error`, request.url));
  }
}

