import { entities } from '@as-lab/core';

export const musicDifficultyMap: Record<entities.Music.Difficulty, string> = {
  [entities.Music.Difficulty.Easy]: '初級',
  [entities.Music.Difficulty.Medium]: '中級',
  [entities.Music.Difficulty.Hard]: '上級',
  [entities.Music.Difficulty.Expert]: '上級＋',
};
