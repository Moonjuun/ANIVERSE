/**
 * Supabase 다국어 이메일 템플릿 업데이트 스크립트
 * 
 * 사용법:
 * 1. .env.local에 SUPABASE_ACCESS_TOKEN이 설정되어 있어야 합니다
 * 2. npm run update-email-template-i18n 실행
 */

require('dotenv').config({ path: '.env.local' });

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = 'cmlagvdidconwojdgnpv'; // ANIVERSE 프로젝트

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('❌ SUPABASE_ACCESS_TOKEN이 .env.local에 설정되지 않았습니다.');
  process.exit(1);
}

// 다국어 이메일 템플릿 (Go Template 조건문 사용)
const emailTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #3b82f6;
      margin-bottom: 10px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #3b82f6;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
    }
    .button:hover {
      background-color: #2563eb;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">AniVerse</div>
      {{ if eq .Data.locale "ko" }}
        <h1>회원가입을 완료해주세요</h1>
      {{ else if eq .Data.locale "en" }}
        <h1>Please complete your signup</h1>
      {{ else if eq .Data.locale "ja" }}
        <h1>登録を完了してください</h1>
      {{ else }}
        <h1>회원가입을 완료해주세요</h1>
      {{ end }}
    </div>
    
    {{ if eq .Data.locale "ko" }}
      <p>안녕하세요!</p>
      <p>AniVerse에 가입해주셔서 감사합니다. 아래 버튼을 클릭하여 이메일 인증을 완료해주세요.</p>
      <div style="text-align: center;">
        <a href="{{ .SiteURL }}/ko/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/ko" class="button">
          이메일 인증하기
        </a>
      </div>
      <p style="font-size: 14px; color: #666;">
        버튼이 작동하지 않는다면, 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
        <a href="{{ .SiteURL }}/ko/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/ko" style="color: #3b82f6; word-break: break-all;">
          {{ .SiteURL }}/ko/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/ko
        </a>
      </p>
      <p style="font-size: 14px; color: #666; margin-top: 30px;">
        이 이메일을 요청하지 않으셨다면, 무시하셔도 됩니다.
      </p>
      <div class="footer">
        <p>© 2025 AniVerse. All rights reserved.</p>
        <p>이 이메일은 AniVerse 회원가입 인증을 위해 발송되었습니다.</p>
      </div>
    {{ else if eq .Data.locale "en" }}
      <p>Hello!</p>
      <p>Thank you for signing up for AniVerse. Please click the button below to complete your email verification.</p>
      <div style="text-align: center;">
        <a href="{{ .SiteURL }}/en/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/en" class="button">
          Verify Email
        </a>
      </div>
      <p style="font-size: 14px; color: #666;">
        If the button doesn't work, please copy and paste the link below into your browser:<br>
        <a href="{{ .SiteURL }}/en/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/en" style="color: #3b82f6; word-break: break-all;">
          {{ .SiteURL }}/en/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/en
        </a>
      </p>
      <p style="font-size: 14px; color: #666; margin-top: 30px;">
        If you didn't request this email, you can safely ignore it.
      </p>
      <div class="footer">
        <p>© 2025 AniVerse. All rights reserved.</p>
        <p>This email was sent for AniVerse signup verification.</p>
      </div>
    {{ else if eq .Data.locale "ja" }}
      <p>こんにちは！</p>
      <p>AniVerseにご登録いただき、ありがとうございます。以下のボタンをクリックして、メール認証を完了してください。</p>
      <div style="text-align: center;">
        <a href="{{ .SiteURL }}/ja/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/ja" class="button">
          メール認証する
        </a>
      </div>
      <p style="font-size: 14px; color: #666;">
        ボタンが動作しない場合は、以下のリンクをコピーしてブラウザに貼り付けてください：<br>
        <a href="{{ .SiteURL }}/ja/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/ja" style="color: #3b82f6; word-break: break-all;">
          {{ .SiteURL }}/ja/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/ja
        </a>
      </p>
      <p style="font-size: 14px; color: #666; margin-top: 30px;">
        このメールをリクエストしていない場合は、無視しても問題ありません。
      </p>
      <div class="footer">
        <p>© 2025 AniVerse. All rights reserved.</p>
        <p>このメールはAniVerseの登録認証のために送信されました。</p>
      </div>
    {{ else }}
      <p>안녕하세요!</p>
      <p>AniVerse에 가입해주셔서 감사합니다. 아래 버튼을 클릭하여 이메일 인증을 완료해주세요.</p>
      <div style="text-align: center;">
        <a href="{{ .SiteURL }}/ko/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/ko" class="button">
          이메일 인증하기
        </a>
      </div>
      <p style="font-size: 14px; color: #666;">
        버튼이 작동하지 않는다면, 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
        <a href="{{ .SiteURL }}/ko/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/ko" style="color: #3b82f6; word-break: break-all;">
          {{ .SiteURL }}/ko/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/ko
        </a>
      </p>
      <p style="font-size: 14px; color: #666; margin-top: 30px;">
        이 이메일을 요청하지 않으셨다면, 무시하셔도 됩니다.
      </p>
      <div class="footer">
        <p>© 2025 AniVerse. All rights reserved.</p>
        <p>이 이메일은 AniVerse 회원가입 인증을 위해 발송되었습니다.</p>
      </div>
    {{ end }}
  </div>
</body>
</html>`;

async function updateEmailTemplate() {
  try {
    console.log('📧 Supabase 다국어 이메일 템플릿 업데이트 중...\n');

    // Subject도 다국어로 처리하기 위해 기본값만 설정 (실제로는 템플릿 내에서 처리 불가)
    // Subject는 단일 값만 지원하므로 한국어로 설정
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mailer_subjects_confirmation: 'AniVerse 회원가입을 완료해주세요',
          mailer_templates_confirmation_content: emailTemplate,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 업데이트 실패:', response.status, errorText);
      process.exit(1);
    }

    const result = await response.json();
    console.log('✅ 다국어 이메일 템플릿이 성공적으로 업데이트되었습니다!\n');
    console.log('📝 지원 언어:');
    console.log('   - 한국어 (ko)');
    console.log('   - 영어 (en)');
    console.log('   - 일본어 (ja)\n');
    console.log('💡 이메일은 사용자가 회원가입할 때 선택한 언어로 자동으로 발송됩니다.\n');
    console.log('⚠️  참고: Subject는 단일 값만 지원하므로 한국어로 설정되었습니다.');
    console.log('   이메일 내용은 사용자의 locale에 따라 자동으로 변경됩니다.\n');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

updateEmailTemplate();

