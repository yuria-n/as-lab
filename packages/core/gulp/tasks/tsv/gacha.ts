import * as gulp from 'gulp';
import * as minimist from 'minimist';

import { Card } from '../../../entities';
import { Gacha, GachaDetail } from '../../../entities';
import { cards, gachaDetails, idols } from '../../../data/masters';
import {
  parseArray,
  parseNumber,
  parseTsv,
  registerTsv,
  reverseMap,
  validate,
  validateObject,
  writeJSON,
  writeTypeScript,
} from './common';

const args = minimist(process.argv);

enum Tsv {
  List = 'ガチャシミュレーター - ガチャ一覧.tsv',
  Detail = 'ガチャシミュレーター - ガチャ詳細.tsv',
}

registerTsv(Tsv);

gulp.task('tsv:gachas', async () => {
  const detailsMap = Object.fromEntries(gachaDetails.map((detail) => [detail.id, detail]));
  const items: Gacha[] = parseTsv(Tsv.List)
    .sort((i1, i2) => Number(i1.order) - Number(i2.order))
    .map((item) => ({
      id: item.id,
      hashKey: parseNumber(item.hashKey),
      title: item.title,
      costs: parseArray(item.costs),
      bundles: parseArray(item.bundles).map((id) => validate(detailsMap, id)),
      picks: JSON.parse(`[${item.picks}]`),
    }));
  for (const { id, title, costs, bundles, picks } of items) {
    if (costs.length !== picks.length) {
      throw new Error(`Invalid the length of costs or picks. id: ${id}, title: ${title}`);
    }
    for (const pick of picks) {
      if (pick.length !== bundles.length) {
        throw new Error(`Invalid the length of pick or bundles. id: ${id}, title: ${title}`);
      }
    }
  }

  const name = 'gacha';
  writeJSON(name, items);

  const script = `
    import { Gacha } from '../../entities';
    import * as json from '../json/${name}.json';

    export const gachas: Gacha[] = json as Gacha[];
  `;
  writeTypeScript(name, script);
});

gulp.task('tsv:gachaDetails', async () => {
  const detail = !!args.detail;
  const rarityMap = reverseMap(Card.Rarity);
  const cardMap = new Map(cards.map((card) => [card.id, card]));
  const idolMap = new Map(idols.map((idol) => [idol.id, idol]));
  const items: GachaDetail[] = parseTsv(Tsv.Detail).map((item) => {
    validateObject(rarityMap, item, 'rarity');
    const featureIds = parseArray(item.featureIds).map((id) => id.toString());
    const featureRates = parseArray(item.featureRates);
    if (featureIds.length !== featureRates.length) {
      throw new Error('Invalid feature rates');
    }

    const inheritances = parseArray(item.inheritances);
    const ids = parseArray(item.ids).map((id) => id.toString());
    return {
      id: item.id,
      rarity: item.rarity as Card.Rarity,
      rate: parseNumber(item.rate),
      inheritances,
      featureIds,
      featureRates,
      ids,
    };
  });
  const itemMap = new Map<GachaDetail['id'], Map<GachaDetail['rarity'], GachaDetail>>();
  for (const item of items) {
    itemMap.set(item.id, itemMap.get(item.id) ?? new Map());
    itemMap.get(item.id)!.set(item.rarity, item);
  }
  const getCardInfo = (id: GachaDetail['id'], rarity: GachaDetail['rarity']) => {
    const detail = itemMap.get(id)?.get(rarity);
    if (!detail) {
      throw new Error(`Detail not found. id: ${id} rarity: ${rarity}`);
    }
    const info = {
      featureIds: [...detail.featureIds],
      featureRates: [...detail.featureRates],
      ids: [...detail.ids],
    };
    for (const id of detail.inheritances) {
      const data = getCardInfo(id, rarity);
      info.featureIds.push(...data.featureIds);
      info.featureRates.push(...data.featureRates);
      info.ids.push(...data.ids);
    }
    return info;
  };

  const details = items.map((item) => {
    const cardInfo = getCardInfo(item.id, item.rarity);
    const cardIds = [...cardInfo.featureIds, ...cardInfo.ids];
    const idSet = new Set<Card['id']>();
    console.log(`\nid: ${item.id}, rarity: ${item.rarity} size: ${cardIds.length}`);
    for (const id of cardIds) {
      if (idSet.has(id)) {
        throw new Error(`Duplicated. id: ${id}`);
      }
      idSet.add(id);
      const card = cardMap.get(id);
      if (!card) {
        throw new Error(`Card not found. id: ${id}, ${item.id}, ${item.rarity}`);
      }
      if (card.rarity !== item.rarity) {
        throw new Error(`Invalid card rarity. id: ${id}, ${item.id}, ${item.rarity}`);
      }
      if (detail) {
        console.log([card.id, card.name, idolMap.get(card.idolId)?.name].join('\t'));
      }
    }
    return {
      ...item,
      ...cardInfo,
    };
  });

  const name = 'gachaDetail';
  writeJSON(name, details);

  const script = `
    import { GachaDetail } from '../../entities';
    import * as json from '../json/${name}.json';

    export const gachaDetails: GachaDetail[] = json as GachaDetail[];
  `;
  writeTypeScript(name, script);
});
