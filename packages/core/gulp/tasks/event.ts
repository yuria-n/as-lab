import * as _ from 'lodash';
import * as gulp from 'gulp';

import { InspirationSkill, Music } from '../../entities';
import { PriorityQueue } from '../../utils';

import Difficulty = Music.Difficulty;
import Rarity = InspirationSkill.Rarity;

gulp.task('event:point', async () => {
  const pointMap = {
    [Difficulty.Hard]: 345,
    [Difficulty.Expert]: 525,
  };
  const pointPerPlay = pointMap[Difficulty.Expert];
  const bonusesMap = {
    [Rarity.SR]: [15, 20, 24, 27, 29, 30],
    [Rarity.UR]: [30, 40, 44, 47, 49, 50],
  };
  const requiredPointsMap = {
    [Rarity.SR]: [7_200, 12_000, 12_000, 70_000, 70_000, 70_000],
    [Rarity.UR]: [34_500, 400_000, 600_000],
  };
  const cards = [
    { id: 'SR1', count: 1, rarity: Rarity.SR },
    { id: 'SR2', count: 3, rarity: Rarity.SR },
    { id: 'UR', count: 3, rarity: Rarity.UR },
  ];
  const cardMap = _.keyBy(cards, 'id');
  const total = cards.reduce((sum, card) => sum + card.count, 0);
  const seen = new Set<string>();
  const permutation: string[][] = [];
  createPermutation([], new Set(cards.map((card) => card.id)), {});

  const queue = new PriorityQueue<Stats>((c1, c2) =>
    c1.playCount === c2.playCount ? c1.remaining < c2.remaining : c1.playCount > c2.playCount,
  );

  for (const cards of permutation) {
    const stats: Stats = { cards: [...cards], playCount: 0, remaining: 0 };
    let bonus = 1;
    const countMap = _.mapValues(cardMap, () => 0);
    while (cards.length) {
      stats.remaining += Math.floor(pointPerPlay * bonus);
      stats.playCount++;
      const [card] = cards;
      const { rarity } = cardMap[card];
      const count = countMap[card];
      const required = requiredPointsMap[rarity][count];
      if (stats.remaining < required) {
        continue;
      }
      stats.remaining -= required;
      cards.shift();
      bonus += bonusesMap[rarity][countMap[card]++] / 100;
    }
    queue.push(stats);
    if (queue.size() > 20) {
      queue.pop();
    }
  }
  while (queue.size()) {
    console.log(queue.pop());
  }

  function createPermutation(cards: string[], remaining: Set<string>, countMap: Record<string, number>) {
    const key = cards.toString();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    if (cards.length === total) {
      permutation.push([...cards]);
      return;
    }
    for (const id of Array.from(remaining)) {
      countMap[id] = ++countMap[id] || 1;
      cards.push(id);
      if (countMap[id] === cardMap[id].count) {
        remaining.delete(id);
      }
      createPermutation(cards, remaining, countMap);
      remaining.add(id);
      cards.pop();
      countMap[id]--;
    }
  }
});

interface Stats {
  cards: string[];
  playCount: number;
  remaining: number;
}
