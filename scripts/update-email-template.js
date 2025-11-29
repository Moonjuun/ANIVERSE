/**
 * Supabase 이메일 템플릿 업데이트 스크립트
 * 
 * 사용법:
 * 1. .env.local에 SUPABASE_ACCESS_TOKEN이 설정되어 있어야 합니다
 * 2. npm run update-email-template 실행
 */

require('dotenv').config({ path: '.env.local' });

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = 'cmlagvdidconwojdgnpv'; // ANIVERSE 프로젝트

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('❌ SUPABASE_ACCESS_TOKEN이 .env.local에 설정되지 않았습니다.');
  process.exit(1);
}

// PKCE Flow용 이메일 템플릿 (한국어)
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
      <h1>회원가입을 완료해주세요</h1>
    </div>
    
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
  </div>
</body>
</html>`;

async function updateEmailTemplate() {
  try {
    console.log('📧 Supabase 이메일 템플릿 업데이트 중...\n');

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
    console.log('✅ 이메일 템플릿이 성공적으로 업데이트되었습니다!\n');
    console.log('📝 업데이트된 내용:');
    console.log('   - Subject: AniVerse 회원가입을 완료해주세요');
    console.log('   - Content: AniVerse 브랜딩이 적용된 HTML 템플릿\n');
    
    console.log('💡 참고: 보낸 사람(Sender) 이름을 변경하려면');
    console.log('   Supabase Dashboard > Authentication > Settings > SMTP Settings에서');
    console.log('   "Sender name"을 "AniVerse"로 설정하세요.\n');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

updateEmailTemplate();

