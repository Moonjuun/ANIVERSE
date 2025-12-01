require('dotenv').config({ path: '.env.local' });

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = 'cmlagvdidconwojdgnpv'; // ANIVERSE 프로젝트

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('❌ SUPABASE_ACCESS_TOKEN이 .env.local에 설정되지 않았습니다.');
  process.exit(1);
}

// 다국어 비밀번호 재설정 이메일 템플릿 (Go Template 조건문 사용)
// Gmail, 네이버 메일 등 모든 이메일 클라이언트 호환성을 고려한 디자인
const emailTemplate = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>{{ if eq .Data.locale "ko" }}비밀번호 재설정{{ else if eq .Data.locale "en" }}Reset Password{{ else if eq .Data.locale "ja" }}パスワードリセット{{ else }}비밀번호 재설정{{ end }} - AniVerse</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #3b82f6; padding: 40px 30px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <div style="width: 64px; height: 64px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; display: inline-block; line-height: 64px; font-size: 32px; text-align: center;">🔐</div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">AniVerse</h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 12px;">
                    <h2 style="margin: 0; font-size: 22px; font-weight: 600; color: #ffffff;">
                      {{ if eq .Data.locale "ko" }}비밀번호 재설정{{ else if eq .Data.locale "en" }}Reset Password{{ else if eq .Data.locale "ja" }}パスワードリセット{{ else }}비밀번호 재설정{{ end }}
                    </h2>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              {{ if eq .Data.locale "ko" }}
                <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #111827;">안녕하세요! 👋</p>
                <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                  비밀번호 재설정을 요청하셨습니다. 아래 버튼을 클릭하여 새 비밀번호를 설정해주세요.
                </p>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
                  <tr>
                    <td align="center">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td align="center" style="background-color: #3b82f6; border-radius: 8px;">
                            <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">비밀번호 재설정하기</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #3b82f6;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #374151;">버튼이 작동하지 않나요?</p>
                      <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #3b82f6; word-break: break-all;">
                        <a href="{{ .ConfirmationURL }}" style="color: #3b82f6; text-decoration: underline;">{{ .ConfirmationURL }}</a>
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <tr>
                    <td style="padding: 16px;">
                      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400e;">
                        <strong>⚠️ 보안 안내:</strong> 이 링크는 24시간 후에 만료됩니다. 만료된 링크는 사용할 수 없으니 주의해주세요.
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px; background-color: #f3f4f6; border-radius: 8px;">
                  <tr>
                    <td style="padding: 16px;">
                      <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                        <strong>💡 참고사항</strong><br>
                        이 이메일을 요청하지 않으셨다면, 무시하셔도 됩니다. 비밀번호는 변경되지 않습니다.<br>
                        만약 계속해서 의심스러운 이메일을 받으신다면, 고객지원팀에 문의해주세요.
                      </p>
                    </td>
                  </tr>
                </table>

              {{ else if eq .Data.locale "en" }}
                <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #111827;">Hello! 👋</p>
                <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                  You have requested to reset your password. Please click the button below to set a new password.
                </p>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
                  <tr>
                    <td align="center">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td align="center" style="background-color: #3b82f6; border-radius: 8px;">
                            <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">Reset Password</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #3b82f6;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #374151;">Button not working?</p>
                      <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #3b82f6; word-break: break-all;">
                        <a href="{{ .ConfirmationURL }}" style="color: #3b82f6; text-decoration: underline;">{{ .ConfirmationURL }}</a>
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <tr>
                    <td style="padding: 16px;">
                      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400e;">
                        <strong>⚠️ Security Notice:</strong> This link will expire after 24 hours. Please note that expired links cannot be used.
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px; background-color: #f3f4f6; border-radius: 8px;">
                  <tr>
                    <td style="padding: 16px;">
                      <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                        <strong>💡 Important</strong><br>
                        If you didn't request this email, you can safely ignore it. Your password will not be changed.<br>
                        If you continue to receive suspicious emails, please contact our support team.
                      </p>
                    </td>
                  </tr>
                </table>

              {{ else if eq .Data.locale "ja" }}
                <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #111827;">こんにちは！ 👋</p>
                <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                  パスワードリセットをリクエストされました。以下のボタンをクリックして、新しいパスワードを設定してください。
                </p>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
                  <tr>
                    <td align="center">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td align="center" style="background-color: #3b82f6; border-radius: 8px;">
                            <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">パスワードをリセット</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #3b82f6;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #374151;">ボタンが動作しませんか？</p>
                      <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #3b82f6; word-break: break-all;">
                        <a href="{{ .ConfirmationURL }}" style="color: #3b82f6; text-decoration: underline;">{{ .ConfirmationURL }}</a>
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <tr>
                    <td style="padding: 16px;">
                      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400e;">
                        <strong>⚠️ セキュリティ通知:</strong> このリンクは24時間後に期限切れになります。期限切れのリンクは使用できませんのでご注意ください。
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px; background-color: #f3f4f6; border-radius: 8px;">
                  <tr>
                    <td style="padding: 16px;">
                      <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                        <strong>💡 ご注意</strong><br>
                        このメールをリクエストしていない場合は、無視しても問題ありません。パスワードは変更されません。<br>
                        疑わしいメールを継続して受信する場合は、サポートチームにお問い合わせください。
                      </p>
                    </td>
                  </tr>
                </table>

              {{ else }}
                <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #111827;">안녕하세요! 👋</p>
                <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                  비밀번호 재설정을 요청하셨습니다. 아래 버튼을 클릭하여 새 비밀번호를 설정해주세요.
                </p>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
                  <tr>
                    <td align="center">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td align="center" style="background-color: #3b82f6; border-radius: 8px;">
                            <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">비밀번호 재설정하기</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #3b82f6;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #374151;">버튼이 작동하지 않나요?</p>
                      <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #3b82f6; word-break: break-all;">
                        <a href="{{ .ConfirmationURL }}" style="color: #3b82f6; text-decoration: underline;">{{ .ConfirmationURL }}</a>
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <tr>
                    <td style="padding: 16px;">
                      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400e;">
                        <strong>⚠️ 보안 안내:</strong> 이 링크는 24시간 후에 만료됩니다. 만료된 링크는 사용할 수 없으니 주의해주세요.
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px; background-color: #f3f4f6; border-radius: 8px;">
                  <tr>
                    <td style="padding: 16px;">
                      <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                        <strong>💡 참고사항</strong><br>
                        이 이메일을 요청하지 않으셨다면, 무시하셔도 됩니다. 비밀번호는 변경되지 않습니다.<br>
                        만약 계속해서 의심스러운 이메일을 받으신다면, 고객지원팀에 문의해주세요.
                      </p>
                    </td>
                  </tr>
                </table>
              {{ end }}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              {{ if eq .Data.locale "ko" }}
                <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.6; color: #6b7280;">
                  이 이메일은 AniVerse 비밀번호 재설정을 위해 발송되었습니다.
                </p>
                <p style="margin: 0 0 16px 0; font-size: 12px; line-height: 1.6; color: #6b7280;">
                  문의사항이 있으시면 언제든지 고객지원팀에 연락해주세요.
                </p>
              {{ else if eq .Data.locale "en" }}
                <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.6; color: #6b7280;">
                  This email was sent for AniVerse password reset.
                </p>
                <p style="margin: 0 0 16px 0; font-size: 12px; line-height: 1.6; color: #6b7280;">
                  If you have any questions, please contact our support team.
                </p>
              {{ else if eq .Data.locale "ja" }}
                <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.6; color: #6b7280;">
                  このメールはAniVerseのパスワードリセットのために送信されました。
                </p>
                <p style="margin: 0 0 16px 0; font-size: 12px; line-height: 1.6; color: #6b7280;">
                  ご質問がございましたら、サポートチームまでお問い合わせください。
                </p>
              {{ else }}
                <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.6; color: #6b7280;">
                  이 이메일은 AniVerse 비밀번호 재설정을 위해 발송되었습니다.
                </p>
                <p style="margin: 0 0 16px 0; font-size: 12px; line-height: 1.6; color: #6b7280;">
                  문의사항이 있으시면 언제든지 고객지원팀에 연락해주세요.
                </p>
              {{ end }}
              <p style="margin: 0; font-size: 11px; color: #9ca3af;">© 2025 AniVerse. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

async function updateEmailTemplate() {
  try {
    console.log('📧 Supabase 다국어 비밀번호 재설정 이메일 템플릿 업데이트 중...\n');

    const response = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mailer_subjects_recovery: 'AniVerse 비밀번호 재설정',
          mailer_templates_recovery_content: emailTemplate,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 업데이트 실패:', response.status, errorText);
      process.exit(1);
    }

    const result = await response.json();
    console.log('✅ 다국어 비밀번호 재설정 이메일 템플릿이 성공적으로 업데이트되었습니다!\n');
    console.log('📝 지원 언어:');
    console.log('   - 한국어 (ko)');
    console.log('   - 영어 (en)');
    console.log('   - 일본어 (ja)\n');
    console.log('💡 이메일은 사용자의 locale 정보에 따라 자동으로 적절한 언어로 발송됩니다.\n');
    console.log('✨ 개선된 호환성:');
    console.log('   - 테이블 기반 레이아웃 (Gmail, 네이버 메일 호환)');
    console.log('   - 인라인 스타일 사용');
    console.log('   - 모든 주요 이메일 클라이언트 지원');
    console.log('   - 반응형 디자인 유지\n');
    console.log('⚠️  참고: Subject는 단일 값만 지원하므로 한국어로 설정되었습니다.');
    console.log('   이메일 내용은 사용자의 locale에 따라 자동으로 변경됩니다.\n');
    console.log('📌 사용자의 locale 정보는 user_metadata.locale에서 가져옵니다.');
    console.log('   만약 locale이 없으면 현재 페이지의 locale을 사용합니다.\n');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

updateEmailTemplate();
