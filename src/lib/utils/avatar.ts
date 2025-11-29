/**
 * 아바타 URL 처리 유틸리티
 * emoji: 형식의 아바타를 이모지로 변환
 */

import { AVATARS } from './avatars';

/**
 * 아바타 URL에서 이모지를 추출
 * @param avatarUrl 아바타 URL (emoji: 형식 또는 일반 URL)
 * @returns 이모지 문자열 또는 null
 */
export function getAvatarEmoji(avatarUrl: string | null): string | null {
  if (!avatarUrl || !avatarUrl.startsWith('emoji:')) {
    return null;
  }
  const avatarId = avatarUrl.replace('emoji:', '');
  const avatar = AVATARS.find(a => a.id === avatarId);
  return avatar ? avatar.emoji : null;
}

/**
 * 아바타가 이모지인지 확인
 * @param avatarUrl 아바타 URL
 * @returns 이모지인지 여부
 */
export function isEmojiAvatar(avatarUrl: string | null): boolean {
  return avatarUrl !== null && avatarUrl.startsWith('emoji:');
}

