export interface WorldCupTheme {
  id: string;
  title: string;
  mediaId?: number;
}

export const WORLD_CUP_THEMES: WorldCupTheme[] = [
  {
    id: "all",
    title: "전체 캐릭터 월드컵",
    mediaId: undefined,
  },
];

export const WORLD_CUP_ROUNDS = [
  { id: 16, label: "16강" },
  { id: 32, label: "32강" },
] as const;

export const GENDER_OPTIONS = [
  { id: undefined, labelKey: "gender_all", emoji: "👫" },
  { id: "Female" as const, labelKey: "gender_female", emoji: "👩" },
  { id: "Male" as const, labelKey: "gender_male", emoji: "👨" },
] as const;

