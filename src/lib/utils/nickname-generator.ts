/**
 * 애니 감성 랜덤 닉네임 생성기
 */

const prefixes = [
  '지나가던',
  '각성한',
  '배고픈',
  '잠든',
  '깨어난',
  '떠도는',
  '숨겨진',
  '잃어버린',
  '찾아낸',
  '부활한',
  '전설의',
  '신화의',
  '마법의',
  '신비한',
  '고대의',
];

const suffixes = [
  '슬라임',
  '흑염룡',
  '루피',
  '나루토',
  '고쿠',
  '이치고',
  '에렌',
  '리바이',
  '레비',
  '미카사',
  '타니지로',
  '네즈코',
  '이타도리',
  '메구미',
  '사토루',
  '사쿠나',
  '아스타',
  '유노',
  '린',
  '사쿠라',
  '사스케',
  '히나타',
  '키라',
  '루키아',
  '오리히메',
  '이치마루',
  '우라하라',
  '아이젠',
  '그림죠',
  '스타크',
];

export function generateRandomNickname(): string {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${prefix}_${suffix}`;
}




