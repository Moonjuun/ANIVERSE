/**
 * 기본 제공 애니 스타일 아바타 목록
 * 10종의 아바타를 제공합니다.
 */

export const AVATARS = [
  {
    id: 'fox',
    name: '🦊',
    emoji: '🦊',
  },
  {
    id: 'robot',
    name: '🤖',
    emoji: '🤖',
  },
  {
    id: 'ninja',
    name: '🥷',
    emoji: '🥷',
  },
  {
    id: 'girl',
    name: '👱‍♀️',
    emoji: '👱‍♀️',
  },
  {
    id: 'boy',
    name: '👱‍♂️',
    emoji: '👱‍♂️',
  },
  {
    id: 'mage',
    name: '🧙',
    emoji: '🧙',
  },
  {
    id: 'warrior',
    name: '⚔️',
    emoji: '⚔️',
  },
  {
    id: 'dragon',
    name: '🐉',
    emoji: '🐉',
  },
  {
    id: 'cat',
    name: '🐱',
    emoji: '🐱',
  },
  {
    id: 'star',
    name: '⭐',
    emoji: '⭐',
  },
] as const;

export type AvatarId = (typeof AVATARS)[number]['id'];

