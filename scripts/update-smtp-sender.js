/**
 * Supabase SMTP 보낸 사람 설정 업데이트 스크립트
 * 
 * 사용법:
 * 1. .env.local에 SUPABASE_ACCESS_TOKEN이 설정되어 있어야 합니다
 * 2. npm run update-smtp-sender 실행
 */

require('dotenv').config({ path: '.env.local' });

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = 'cmlagvdidconwojdgnpv'; // ANIVERSE 프로젝트

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('❌ SUPABASE_ACCESS_TOKEN이 .env.local에 설정되지 않았습니다.');
  process.exit(1);
}

async function updateSMTPSender() {
  try {
    console.log('📧 Supabase SMTP 보낸 사람 설정 업데이트 중...\n');

    // 먼저 현재 설정을 가져옵니다
    const getResponse = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.error('❌ 설정 조회 실패:', getResponse.status, errorText);
      process.exit(1);
    }

    const currentConfig = await getResponse.json();
    
    // SMTP 설정 업데이트
    const updateData = {
      smtp_sender_name: 'AniVerse',
    };

    // 기존 SMTP 설정이 있으면 유지하고, 없으면 기본값 추가
    if (currentConfig.smtp_admin_email) {
      updateData.smtp_admin_email = currentConfig.smtp_admin_email;
    } else {
      // 기본 이메일 주소 (실제 도메인으로 변경 필요)
      updateData.smtp_admin_email = 'no-reply@aniverse.com';
    }

    const response = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 업데이트 실패:', response.status, errorText);
      console.log('\n💡 참고: SMTP 설정은 Supabase Dashboard에서 직접 설정해야 할 수 있습니다.');
      console.log('   Dashboard > Authentication > Settings > SMTP Settings\n');
      process.exit(1);
    }

    const result = await response.json();
    console.log('✅ SMTP 보낸 사람 설정이 성공적으로 업데이트되었습니다!\n');
    console.log('📝 업데이트된 내용:');
    console.log(`   - Sender Name: AniVerse`);
    console.log(`   - Admin Email: ${updateData.smtp_admin_email}\n`);
    
    console.log('⚠️  주의: 프로덕션 환경에서는 커스텀 SMTP 서버 설정을 권장합니다.');
    console.log('   (Resend, AWS SES, SendGrid 등)\n');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.log('\n💡 참고: SMTP 설정은 Supabase Dashboard에서 직접 설정해야 할 수 있습니다.');
    console.log('   Dashboard > Authentication > Settings > SMTP Settings\n');
    process.exit(1);
  }
}

updateSMTPSender();

