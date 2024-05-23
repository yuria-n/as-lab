import { Card, Gacha, GachaDetail } from '../entities';
import { groupBy, times } from '../utils';

export class GachaSimulator {
  static melonMap: Record<Card.Rarity, number> = {
    [Card.Rarity.Ur]: 25,
    [Card.Rarity.Sr]: 5,
    [Card.Rarity.R]: 1,
  };
  static melonExchangeRate = 125;
  private static resolution = 1e2;
  private readonly melonThreshold = 7;
  private readonly info = new GachaSimulator.GachaInfo();
  private readonly detailsMap: Map<GachaDetail['id'], GachaDetail[]>;
  private readonly cardCountMap = new Map<Card['id'], number>();
  private readonly histories: GachaSimulator.Stats[] = [];
  constructor(private readonly gacha: Gacha, details: GachaDetail[]) {
    this.detailsMap = groupBy(details, (detail) => detail.id);
    this.validate();
  }

  private validate() {
    for (const [id, details] of this.detailsMap) {
      const sum = details.reduce((sum, detail) => sum + detail.rate, 0);
      if (sum !== 1) {
        throw new Error(`Invalid details. id: ${id}`);
      }
    }
  }

  draw(costIndex: number): GachaSimulator.CardInfo[] {
    this.info.spent += this.gacha.costs[costIndex];
    const cards: GachaSimulator.CardInfo[] = [];
    for (const [index, count] of this.gacha.picks[costIndex].entries()) {
      this.info.count += count;
      for (let c = 0; c < count; c++) {
        const detailId = this.gacha.bundles[index];
        const details = this.detailsMap.get(detailId)!;
        const sum = details.reduce((sum, detail) => sum + detail.rate, 0) * 10000;
        let rand = Math.floor(Math.random() * sum) / sum;
        const detail = details.find((detail) => {
          if (rand < detail.rate) {
            return true;
          }
          rand -= detail.rate;
          return false;
        })!;
        rand = Math.floor(Math.random() * sum) / sum;

        const featureCardId = detail.featureIds.find((id, index) => {
          const rate = detail.featureRates[index];
          if (!rate) {
            throw new Error('Invalid rate');
          }
          if (rand < rate) {
            return true;
          }
          rand -= rate;
          return false;
        });
        const cardId = featureCardId ?? detail.ids[Math.floor(Math.random() * detail.ids.length)];
        const count = ~~this.cardCountMap.get(cardId)! + 1;
        const melon = count >= this.melonThreshold;
        this.info.countMap[detail.rarity]++;
        if (melon) {
          this.info.melon += GachaSimulator.melonMap[detail.rarity];
        } else {
          this.info.realCountMap[detail.rarity]++;
        }
        this.cardCountMap.set(cardId, count);
        cards.push({ id: cardId, count, feature: !!featureCardId, melon });
      }
    }
    this.histories.push({ info: this.info.child(), expectedValues: this.getExpectedValues() });
    return cards;
  }

  getStats(): GachaSimulator.Stats {
    return { info: this.info, expectedValues: this.getExpectedValues() };
  }

  getHistories(size: Value): GachaSimulator.Stats[] {
    size = Math.min(size, this.histories.length);
    if (size === 0) {
      return [];
    }
    const stats: GachaSimulator.Stats[] = times(size - 1, (current) => {
      const index = Math.floor(current * (this.histories.length / size));
      return this.histories[index];
    });
    stats.push(this.histories[this.histories.length - 1]);
    return stats;
  }

  private getExpectedValues(): GachaSimulator.ExpectedValueInfo[] {
    return this.gacha.costs.map((_, index) => ({
      required: this.getExpectedValue(index, false, false),
      userRequired: this.getExpectedValue(index, false, true),
      melonRequired: this.getExpectedValue(index, true, false),
      userMelonRequired: this.getExpectedValue(index, true, true),
    }));
  }

  /**
   * It expects user doesn't have any melons
   */
  private getExpectedValue(costIndex: number, melon: boolean, withUserData: boolean): number {
    const cost = this.gacha.costs[costIndex];
    const total = this.gacha.picks[costIndex].reduce((sum, count, index) => {
      const detailId = this.gacha.bundles[index];
      const details = this.detailsMap.get(detailId)!;
      for (const { rarity, rate, ids } of details) {
        const cardIds = withUserData ? ids : ['-1'];
        const baseRate = rate / cardIds.length;
        for (const id of cardIds) {
          const drawn = this.cardCountMap.get(id) ?? 0;
          if (drawn < this.melonThreshold) {
            if (rarity === Card.Rarity.Ur) {
              sum += count * baseRate;
              continue;
            }
            if (withUserData) {
              continue;
            }
          }
          if (!melon) {
            continue;
          }
          sum += (count * baseRate * GachaSimulator.melonMap[rarity]) / GachaSimulator.melonExchangeRate;
        }
      }
      return sum;
    }, 0);
    return GachaSimulator.fixNumber(cost / total);
  }

  static fixNumber(num: Value) {
    if (isNaN(num)) {
      return Infinity;
    }
    return Math.round(num * this.resolution) / this.resolution;
  }

  static encodeGacha(hashKey: number, max: number, cardIds: Card['id'][]) {
    if (hashKey >= 900) {
      throw new Error('Limit exceeded');
    }
    const hash = this.encode(max, cardIds);
    const hashWithKey = `${(hashKey + 100).toString()}${hash}`;
    const base62 = this.toBase62(hashWithKey);
    return base62;
  }

  private static encode(max: number, cardIds: Card['id'][]) {
    if (max >= 9000) {
      throw new Error('Limit exceeded');
    }
    const base = (max + 1)
      .toString()
      .split('')
      .map((n) => Number(n))
      .reverse();
    let cur = [1];
    const ids = cardIds.map((id) => Number(id));
    let id = ids.shift()!;
    const hash: number[] = [];
    while (id > 0) {
      hash[hash.length] = id % 10;
      id = (id / 10) | 0;
    }
    for (let id of ids) {
      // 16 -> 256 -> 4906...
      const next: number[] = [];
      for (let i = 0; i < base.length; i++) {
        for (let j = 0; j < cur.length; j++) {
          let val = base[i] * cur[j];
          let index = i + j;
          do {
            next[index] = next[index] ?? 0;
            next[index] += val;
            val = (next[index] / 10) | 0;
            next[index] %= 10;
            index++;
          } while (val > 0);
        }
      }
      cur = next;
      let i = 0;
      while (id > 0) {
        let prev = 0;
        for (let j = 0; j < cur.length; j++) {
          const index = i + j;
          hash[index] = hash[index] ?? 0;
          hash[index] += (id % 10) * cur[j] + prev;
          prev = (hash[index] / 10) | 0;
          hash[index] %= 10;
        }
        if (prev) {
          const index = i + cur.length;
          hash[index] = hash[index] ?? 0;
          hash[index] += prev;
        }
        id = (id / 10) | 0;
        i++;
      }
    }
    return `${max.toString().padStart(4, '0')}${hash.reverse().join('')}`;
  }
  static decodeGacha(base62: string) {
    const hashWithKey = this.toHashFromBase62(base62);
    const hashKey = Number(hashWithKey.slice(0, 3)) - 100;
    const hash = hashWithKey.slice(3);
    const cardIds = this.decode(hash);
    return { hashKey, cardIds };
  }

  private static toBase62(hash: string) {
    const code = this.decode('0061' + hash);
    return code
      .map((str) => {
        const num = Number(str);
        if (num < 10) {
          return num.toString();
        }
        // 65~90
        if (num < 10 + 26) {
          return String.fromCharCode(num + 55);
        }
        // 97~122
        return String.fromCharCode(num + 61);
      })
      .join('');
  }

  private static toHashFromBase62(base62: string) {
    const code = base62
      .split('')
      .map((char) => {
        if (!isNaN(Number(char))) {
          return Number(char) - 1;
        }
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return code - 55 - 1;
        }
        return code - 61 - 1;
      })
      .map((code) => (++code).toString());

    const hashWithKey = this.encode(61, code);
    const hash = hashWithKey.slice(4);
    return hash;
  }

  private static decode(hash: string) {
    const base = (Number(hash.slice(0, 4)) + 1)
      .toString()
      .split('')
      .map((n) => Number(n))
      .reverse();
    while (base[base.length - 1] === 0) {
      base.pop();
    }
    const list = [[1]];
    const numHash = hash.slice(4);
    let nums = numHash
      .split('')
      .map((n) => Number(n))
      .reverse();
    while (numHash.length + 1 > list[list.length - 1].length) {
      // 16 -> 256 -> 4906...
      const cur = list[list.length - 1];
      const next: number[] = [];
      for (let i = 0; i < base.length; i++) {
        for (let j = 0; j < cur.length; j++) {
          let val = base[i] * cur[j];
          let index = i + j;
          do {
            next[index] = next[index] ?? 0;
            next[index] += val;
            val = (next[index] / 10) | 0;
            next[index] %= 10;
            index++;
          } while (val > 0);
        }
      }
      if (next.length > numHash.length) {
        break;
      }
      list.push(next);
    }
    const cardIds: string[] = [];
    while (list.length > 0) {
      const cur = list.pop()!;
      let count = 0;
      // eslint-disable-next-line no-constant-condition
      sum: while (true) {
        const prevNums = [...nums];
        let i = -1;
        while (++i < cur.length) {
          let val = cur[i];
          for (let j = i; j < nums.length; j++) {
            nums[j] -= val;
            if (nums[j] >= 0) {
              val = 0;
              break;
            }
            val = 1;
            nums[j] += 10;
          }
          if (val !== 0) {
            nums = prevNums;
            break sum;
          }
        }
        count++;
      }
      if (cardIds.length === 0 && count === 0) {
        continue;
      }
      cardIds.push(count.toString());
    }
    return cardIds.reverse();
  }
}

export namespace GachaSimulator {
  export interface CardInfo {
    id: Card['id'];
    count: Value;
    feature: boolean;
    melon: boolean;
  }

  export interface ExpectedValueInfo {
    required: Value;
    userRequired: Value;
    melonRequired: Value;
    userMelonRequired: Value;
  }

  export interface RarityCountMap {
    [Card.Rarity.Ur]: Value;
    [Card.Rarity.Sr]: Value;
    [Card.Rarity.R]: Value;
  }

  export class GachaInfo {
    count: Value = 0;
    melon: Value = 0;
    spent: Value = 0;
    countMap = {
      [Card.Rarity.Ur]: 0,
      [Card.Rarity.Sr]: 0,
      [Card.Rarity.R]: 0,
    };
    realCountMap = {
      [Card.Rarity.Ur]: 0,
      [Card.Rarity.Sr]: 0,
      [Card.Rarity.R]: 0,
    };

    child() {
      const gacha = new GachaInfo();
      Object.assign(gacha, { ...this, countMap: { ...this.countMap }, realCountMap: { ...this.realCountMap } });
      return gacha;
    }

    getCountRate(rarity: Card.Rarity) {
      if (this.count === 0) {
        return 0;
      }
      return GachaSimulator.fixNumber((this.countMap[rarity] / this.count) * 100);
    }

    getRealCountRate(rarity: Card.Rarity) {
      if (this.count === 0) {
        return 0;
      }
      return GachaSimulator.fixNumber((this.realCountMap[rarity] / this.count) * 100);
    }

    getSpentPerCount(rarity: Card.Rarity) {
      return GachaSimulator.fixNumber(this.spent / this.countMap[rarity]);
    }

    getSpentPerRealCount(rarity: Card.Rarity) {
      return GachaSimulator.fixNumber(this.spent / this.realCountMap[rarity]);
    }

    getSpentPerRealCountWithMelon(rarity: Card.Rarity) {
      return GachaSimulator.fixNumber(
        this.spent / (this.realCountMap[rarity] + Math.floor(this.melon / GachaSimulator.melonExchangeRate)),
      );
    }
  }

  export interface Stats {
    info: GachaInfo;
    expectedValues: ExpectedValueInfo[];
  }
}
