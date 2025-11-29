/**
 * AniVerse 가데이터 삽입 스크립트
 * 
 * 사용 방법:
 * 1. .env.local에 SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 설정되어 있어야 합니다.
 * 2. npm run seed 또는 node scripts/seed-data.js 실행
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 .env.local에 설정하세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seedData() {
  console.log('🌱 가데이터 삽입 시작...\n');

  try {
    // 1. 기존 사용자 조회
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      throw usersError;
    }

    if (!users || users.users.length === 0) {
      console.log('⚠️  사용자가 없습니다. 먼저 앱에서 회원가입을 진행하세요.');
      console.log('   또는 Supabase Dashboard의 Authentication에서 사용자를 생성하세요.\n');
      return;
    }

    console.log(`✅ ${users.users.length}명의 사용자를 찾았습니다.\n`);

    const userIds = users.users.map(u => u.id);

    // 2. 사용자 프로필 생성/업데이트
    console.log('📝 사용자 프로필 생성 중...');
    const profiles = [
      {
        id: userIds[0],
        username: 'anime_lover',
        display_name: '애니메이션 애호가',
        bio: '애니메이션을 사랑하는 사람입니다. 다양한 작품을 감상하고 리뷰를 작성합니다.',
        avatar_url: null,
      },
    ];

    if (userIds.length > 1) {
      profiles.push({
        id: userIds[1],
        username: 'reviewer_pro',
        display_name: '리뷰 전문가',
        bio: '애니메이션 리뷰를 전문적으로 작성합니다.',
        avatar_url: null,
      });
    }

    for (const profile of profiles) {
      const { error } = await supabase
        .from('user_profiles')
        .upsert(profile, { onConflict: 'id' });
      
      if (error) {
        console.error(`❌ 프로필 생성 실패 (${profile.username}):`, error.message);
      } else {
        console.log(`   ✓ ${profile.display_name} 프로필 생성 완료`);
      }
    }

    // 3. 리뷰 생성
    console.log('\n📝 리뷰 생성 중...');
    const reviews = [
      {
        user_id: userIds[0],
        anime_id: 1396, // Attack on Titan
        rating: 9,
        title: '진정한 걸작',
        content: '공격거인은 단순한 액션 애니메이션이 아닙니다. 깊이 있는 스토리와 캐릭터 개발, 그리고 예상치 못한 전개가 매회를 기대하게 만듭니다. 특히 세계관 설정이 탁월하고, 인간의 본성에 대한 철학적 질문을 던집니다. 액션씬도 매우 역동적이고, 음악도 뛰어납니다. 애니메이션 팬이라면 반드시 봐야 할 작품입니다.',
      },
      {
        user_id: userIds[0],
        anime_id: 37854, // One Piece
        rating: 10,
        title: '최고의 모험',
        content: '원피스는 단순한 모험담이 아닙니다. 우정, 꿈, 자유에 대한 이야기입니다. 20년이 넘는 연재 기간 동안 쌓아온 스토리는 정말 압도적입니다. 각 캐릭터의 성장과 배경 스토리가 감동적이고, 세계관도 매우 방대합니다. 웃음과 눈물이 공존하는 진정한 걸작입니다.',
      },
    ];

    if (userIds.length > 1) {
      reviews.push(
        {
          user_id: userIds[1],
          anime_id: 85937, // Demon Slayer
          rating: 8,
          title: '시각적 쾌감',
          content: '귀멸의 칼날은 애니메이션 퀄리티가 정말 뛰어납니다. 특히 전투씬의 연출이 압도적이고, 색감과 작화가 매우 아름답습니다. 스토리도 탄탄하고, 캐릭터들의 매력이 뛰어납니다. 다만 후반부 전개가 다소 급하게 느껴질 수 있지만, 전체적으로는 매우 만족스러운 작품입니다.',
        },
        {
          user_id: userIds[1],
          anime_id: 95479, // Jujutsu Kaisen
          rating: 9,
          title: '현대 판타지의 정수',
          content: '주술회전은 현대 배경의 판타지 작품으로서 매우 잘 만들어진 작품입니다. 주술 시스템이 체계적이고, 캐릭터들의 개성이 뚜렷합니다. 특히 전투씬의 연출이 매우 역동적이고, 스토리 전개도 긴장감 넘칩니다. 애니메이션 퀄리티도 뛰어나서 시각적 즐거움을 제공합니다.',
        }
      );
    }

    for (const review of reviews) {
      const { error } = await supabase
        .from('reviews')
        .upsert(review, { onConflict: 'user_id,anime_id' });
      
      if (error) {
        console.error(`❌ 리뷰 생성 실패 (${review.title}):`, error.message);
      } else {
        console.log(`   ✓ "${review.title}" 리뷰 생성 완료`);
      }
    }

    // 4. 찜하기 생성
    console.log('\n📝 찜하기 생성 중...');
    const favorites = [
      { user_id: userIds[0], anime_id: 1396 },   // Attack on Titan
      { user_id: userIds[0], anime_id: 37854 },  // One Piece
      { user_id: userIds[0], anime_id: 85937 },  // Demon Slayer
      { user_id: userIds[0], anime_id: 95479 },  // Jujutsu Kaisen
    ];

    if (userIds.length > 1) {
      favorites.push(
        { user_id: userIds[1], anime_id: 85937 },  // Demon Slayer
        { user_id: userIds[1], anime_id: 95479 },   // Jujutsu Kaisen
        { user_id: userIds[1], anime_id: 120089 },  // Spy x Family
      );
    }

    for (const favorite of favorites) {
      const { error } = await supabase
        .from('favorites')
        .upsert(favorite, { onConflict: 'user_id,anime_id' });
      
      if (error) {
        console.error(`❌ 찜하기 생성 실패:`, error.message);
      } else {
        console.log(`   ✓ 애니메이션 ID ${favorite.anime_id} 찜하기 완료`);
      }
    }

    console.log('\n✅ 가데이터 삽입 완료!');
    console.log(`\n📊 생성된 데이터:`);
    console.log(`   - 사용자 프로필: ${profiles.length}개`);
    console.log(`   - 리뷰: ${reviews.length}개`);
    console.log(`   - 찜하기: ${favorites.length}개`);

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

seedData();




