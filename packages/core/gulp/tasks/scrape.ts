import * as gulp from 'gulp';
import * as minimist from 'minimist';
import * as puppeteer from 'puppeteer';
import Aigle from 'aigle';
import { execSync } from 'child_process';

import { Card, Condition, Grade, School, SkillEffect, SkillTarget } from '../../entities';
import { download } from './download';
import { idols, skillTargetTitleMap } from '../../data/masters';
import { libs } from '../../index';

const args = minimist(process.argv);

const baseUrl = 'https://lovelive-as.boom-app.wiki/entry';
const prefix = 'chara-';

/**
 * gulp scrape:card --id 1
 */
gulp.task('scrape:card', async () => {
  const id = Number(args.id);
  if (isNaN(id)) {
    throw new Error('Invalid ID');
  }
  const tsv = await parseCard(id);
  console.log(tsv);
  execSync(`echo "${tsv}" | pbcopy`);
});

/**
 * gulp scrape:cards --from 1 --to 100
 */
gulp.task('scrape:cards', async () => {
  const from = Number(args.from);
  if (isNaN(from)) {
    throw new Error('Invalid from');
  }
  const to = Number(args.to);
  if (isNaN(to)) {
    throw new Error('Invalid to');
  }
  const list: string[] = [];
  for (let id = from; id <= to; id++) {
    try {
      const tsv = await parseCard(id);
      list.push(tsv);
      if (id === to) {
        continue;
      }
      const delay = Math.random() * 5000 + 5000;
      await Aigle.delay(delay);
    } catch (err) {
      console.error(err);
      break;
    }
  }
  const tsv = list.join('\n');
  console.log(tsv);
  execSync(`echo "${tsv}" | pbcopy`);
});

/**
 * gulp scrape:card:names --from 1 --to 100
 */
gulp.task('scrape:card:names', async () => {
  const from = Number(args.from);
  if (isNaN(from)) {
    throw new Error('Invalid from');
  }
  const to = Number(args.to);
  if (isNaN(to)) {
    throw new Error('Invalid to');
  }
  const list: string[] = [];
  for (let id = from; id <= to; id++) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = `${baseUrl}/${prefix}${id}`;
    console.log(`Getting page... ${url}`);
    await page.goto(url);
    const { name } = await getIdolWithTitle(page);
    list.push(name);
    await browser.close();
  }
  const tsv = list.join('\n');
  console.log(tsv);
  execSync(`echo "${tsv}" | pbcopy`);
});

async function parseCard(id: number) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const cardId = id.toString();
  const url = `${baseUrl}/${prefix}${id}`;
  console.log(`Getting page... ${url}`);
  await page.goto(url);
  const [
    { name, evolutionName, idol },
    rarity,
    attribute,
    type,
    appeal,
    stamina,
    technique,
    skill,
    personalSkillIds,
  ] = await Promise.all([
    getIdolWithTitle(page),
    getRarity(page),
    getAttribute(page),
    getType(page),
    getAppeal(page),
    getStamina(page),
    getTechnique(page),
    getSkill(page),
    getPersonalSkillIds(page),
  ]);
  const card = {
    id: cardId,
    idolId: idol.id,
    name,
    evolutionName,
    rarity,
    type,
    attribute,
    appeal,
    technique,
    stamina,
    skill,
    personalSkillIds,
  };
  const tsv = [
    card.id,
    card.idolId,
    card.name,
    card.evolutionName,
    card.rarity,
    card.attribute,
    card.type,
    card.appeal,
    card.stamina,
    card.technique,
    card.skill.id,
    card.skill.title,
    '',
    '',
    card.personalSkillIds.join(','),
  ].join('\t');
  console.log(card);
  await browser.close();
  await download(id);
  return tsv;
}

async function getIdolWithTitle(page: puppeteer.Page) {
  const baseName = await page.evaluate(
    () => document.querySelector('.table-center tbody tr:nth-child(1) td')?.textContent,
  );
  if (!baseName) {
    throw new Error('Name could not found');
  }
  const baseEvolutionName = await page.evaluate(
    () => document.querySelector('.table-center tbody tr:nth-child(2) td')?.textContent,
  );
  if (!baseEvolutionName) {
    throw new Error('Evolution name could not found');
  }
  const idolMap = new Map(idols.map((idol) => [idol.name.replace(/\s/g, ''), idol]));
  const [, name, idolName] = baseName.match(/\[(.*)](.*)/) ?? [];
  const [, evolutionName] = baseEvolutionName.match(/\[(.*)](.*)/) ?? [];
  if (!idolMap.has(idolName)) {
    throw new Error('Idol not found');
  }
  return {
    name,
    evolutionName,
    idol: idolMap.get(idolName)!,
  };
}

async function getRarity(page: puppeteer.Page) {
  const rarity = await page.evaluate(
    () => document.querySelector('.table-center tbody tr:nth-child(3) td')?.textContent as Card.Rarity,
  );
  if (!rarity) {
    throw new Error('Rarity could not found');
  }
  const raritySet = new Set(Object.values(Card.Rarity));
  if (!raritySet.has(rarity)) {
    throw new Error('Rarity not found');
  }
  return rarity;
}

const attributeMap = new Map([
  ['スマイル', Card.Attribute.Smile],
  ['ピュア', Card.Attribute.Pure],
  ['クール', Card.Attribute.Cool],
  ['アクティブ', Card.Attribute.Active],
  ['ナチュラル', Card.Attribute.Natural],
  ['エレガント', Card.Attribute.Elegant],
]);

async function getAttribute(page: puppeteer.Page) {
  const attribute = await page.evaluate(
    () => document.querySelector('.table-center tbody tr:nth-child(4) td a')?.textContent?.trim() as Card.Attribute,
  );
  if (!attribute) {
    throw new Error('Attribute could not found');
  }
  if (!attributeMap.has(attribute)) {
    throw new Error('Attribute not found');
  }
  return attributeMap.get(attribute)!;
}

const typeMap = new Map([
  ['ボルテージ', Card.Type.Vo],
  ['SP', Card.Type.Sp],
  ['ガード', Card.Type.Gd],
  ['スキル', Card.Type.Sk],
]);
async function getType(page: puppeteer.Page) {
  const type = await page.evaluate(
    () =>
      document.querySelector('.table-center tbody tr:nth-child(4) td:nth-child(4) a')?.textContent?.trim() as Card.Type,
  );
  if (!type) {
    throw new Error('Type could not found');
  }
  if (!typeMap.has(type)) {
    throw new Error('Type not found');
  }
  return typeMap.get(type)!;
}

export async function getSchool(page: puppeteer.Page) {
  const school = await page.evaluate(
    () => document.querySelector('.entry-body .table-center:nth-child(9) tbody tr td')?.textContent,
  );
  if (!school) {
    throw new Error('School could not found');
  }
  const schoolMap = new Map([
    ['音ノ木坂学院', School.Muse],
    ['浦の星女学院', School.Aqua],
    ['虹ヶ咲学園', School.Niji],
  ]);
  if (!schoolMap.has(school)) {
    throw new Error('School not found');
  }
  return schoolMap.get(school)!;
}

export async function getGrade(page: puppeteer.Page) {
  const grade = await page.evaluate(
    () =>
      document.querySelector('.entry-body .table-center:nth-child(9) tbody tr:nth-child(1) td:nth-child(4)')
        ?.textContent,
  );
  if (!grade) {
    throw new Error('Grade could not found');
  }
  const gradeMap = new Map([
    ['1年生', Grade.First],
    ['2年生', Grade.Second],
    ['3年生', Grade.Third],
  ]);
  if (!gradeMap.has(grade)) {
    throw new Error('Grade not found');
  }
  return gradeMap.get(grade)!;
}

function parseParameter(value: string) {
  const [, num = ''] = value.match(/(\d+).*/) ?? [];
  return Number(num.trim());
}

async function getAppeal(page: puppeteer.Page) {
  const value = await page.evaluate(
    () =>
      document.querySelector('.entry-body .table-center:nth-child(16) tbody tr:nth-child(2) td:nth-child(3)')
        ?.textContent,
  );
  const appeal = parseParameter(value ?? '');
  if (isNaN(Number(appeal))) {
    throw new Error('Appeal could not found');
  }
  return Number(appeal);
}

async function getStamina(page: puppeteer.Page) {
  const value = await page.evaluate(
    () =>
      document.querySelector('.entry-body .table-center:nth-child(16) tbody tr:nth-child(3) td:nth-child(3)')
        ?.textContent,
  );
  const stamina = parseParameter(value ?? '');
  if (isNaN(Number(stamina))) {
    throw new Error('Appeal could not found');
  }
  return Number(stamina);
}

async function getTechnique(page: puppeteer.Page) {
  const value = await page.evaluate(
    () =>
      document.querySelector('.entry-body .table-center:nth-child(16) tbody tr:nth-child(4) td:nth-child(3)')
        ?.textContent,
  );
  const technique = parseParameter(value ?? '');
  if (isNaN(Number(technique))) {
    throw new Error('Appeal could not found');
  }
  return Number(technique);
}

async function getSkill(page: puppeteer.Page) {
  const title = await page.evaluate(() => document.querySelector('.entry-body h4')?.textContent);
  if (!title) {
    throw new Error('Skill evolutionName could not found');
  }
  const id = await getSkillId(page, 22);
  return { id, title };
}

async function getPersonalSkillIds(page: puppeteer.Page) {
  const skillIds = await Aigle.map([26, 28], (index) => getSkillId(page, index));
  return skillIds.filter((data) => data);
}

const passiveEffectMap = new Map([
  ['アピール増加', SkillEffect.AppealPlus],
  ['アピール&スタミナ増加', SkillEffect.AppealPlusAndStaminaPlus],
  ['アピール&テクニック増加', SkillEffect.AppealPlusAndTechniquePlus],
  ['テクニック&スタミナ', SkillEffect.TechniquePlusAndStaminaPlus],
  ['テクニック増加', SkillEffect.TechniquePlus],
  ['スタミナ増加', SkillEffect.StaminaPlus],
]);

const liveEffectMap = new Map([
  ['アピール増加', SkillEffect.AppealUp],
  // ['アピール増加', SkillEffect.AppealPlus],
  ['ボルテージ増加', SkillEffect.VoltageUp],
  ['ボルテージ獲得', SkillEffect.VoltageGain],
  // クリティカル時以外も出てくるかも
  ['ボルテージ上限解放', SkillEffect.VoltageLimitPlusCritical],
  ['ボルテージ獲得&アピール増加', SkillEffect.VoltageGainAndAppealUp],
  ['テクニック増加', SkillEffect.TechniqueUp],
  // ['', SkillEffect.TechniquePlus],
  ['クリティカル値上昇', SkillEffect.CriticalUp],
  // ['', SkillEffect.CriticalPlus],
  ['クリティカル率上昇', SkillEffect.CriticalRateUp],
  ['クリティカル率/クリティカル値上昇', SkillEffect.CriticalRateUpAndCriticalUp],
  ['クリティカル率＆ボルテージ増加', SkillEffect.CriticalRateUpAndVoltageUp],
  // ['', SkillEffect.ComboCount],
  ['特技発動率上昇', SkillEffect.SkillInvocationUp],
  // ['', SkillEffect.SkillInvocationPlus],
  ['SP特技ボルテージ増加', SkillEffect.SpSkillUp],
  ['SPゲージ獲得量上昇', SkillEffect.SpGaugeGainUp],
  // うーん
  // ['SPゲージ獲得', SkillEffect.SpGaugeGainPlus],
  // ['SPゲージ獲得', SkillEffect.SpGaugeGain],
  ['SP獲得＆SP特技ボルテージ増加', SkillEffect.SpGaugeGainRateAndSpSkillUp],

  // ['スタミナ増加', SkillEffect.StaminaPlus],
  ['スタミナ回復', SkillEffect.StaminaRecovery],
  ['スタミナ回復&シールド獲得', SkillEffect.StaminaRecoveryAndShieldGain],
  ['スタミナダメージ軽減', SkillEffect.DamageReduction],
  ['シールド獲得', SkillEffect.ShieldGain],
  ['効果解除', SkillEffect.Deactivation],
  ['復活', SkillEffect.Revival],

  ['SP特技オーバーチャージ＆SP特技UPEX', SkillEffect.SpSkillOverChargeAndSpSkillUpEx],
]);

const conditionMap = new Map([
  ['', Condition.Type.Probability],
  // ['', Condition.Type.Stamina],
  ['作戦切替時', Condition.Type.ChangeTeam],
  ['作戦変更時', Condition.Type.ChangeTeam],
  ['作戦変更時に1回だけ発動', Condition.Type.ChangeTeamOnce],
  ['楽曲開始時', Condition.Type.MusicStart],
  ['楽曲開始時1回だけ発動', Condition.Type.MusicStart],
  ['アピールチャンス(AC)開始時', Condition.Type.AcStart],
  ['アピールチャンス（AC）開始時', Condition.Type.AcStart],
  ['アピールチャンス(AC)開始時1回だけ発動', Condition.Type.AcStartOnce],
  ['アピールチャンス（AC）開始時2回だけ発動', Condition.Type.AcStartTimes],
  ['AC成功時', Condition.Type.AcSuccess],
  ['アピールチャンス(AC)成功時', Condition.Type.AcSuccess],
  ['アピールチャンス（AC）成功時', Condition.Type.AcSuccess],
  ['アピールチャンス(AC)成功時1回だけ発動', Condition.Type.AcSuccessOnce],
  ['アピールチャンス(AC)開始時に1回だけ発動', Condition.Type.AcSuccessOnce],
  ['アピールチャンス（AC）開始時1回だけ発動', Condition.Type.AcSuccessOnce],
  ['アピールチャンス(AC)成功時1回だめ発動', Condition.Type.AcSuccessOnce],
  ['アピールチャンス(AC)失敗時', Condition.Type.AcFailed],
  ['アピールチャンス（AC）失敗時', Condition.Type.AcFailed],
  ['SP特技発動時', Condition.Type.SpSkill],
  ['SP特技発動時時', Condition.Type.SpSkill],
  ['SP特技発動時1回だけ発動', Condition.Type.SpSkillOnce],
  ['自身のアピール時', Condition.Type.Appeal],
  ['自身のクリティカル時', Condition.Type.Critical],
  ['楽曲と属性一致時', Condition.Type.SameAttribute],
]);

const conditionRegexMap = new Map([
  [/スタミナが/, Condition.Type.Stamina],
  [/ダメージ以上受けた時/, Condition.Type.Damage],
  [/目標ボルテージ/, Condition.Type.TargetVoltage],
  [/SP特技発動時[に]?\d+回だけ発動/, Condition.Type.SpSkillTimes],
  [/自身のクリティカル時[に]?\d+回だけ発動/, Condition.Type.CriticalTimes],
  [/作戦変更時に\d+回だけ発動/, Condition.Type.ChangeTeamTimes],
  [/アピールチャンス\(AC\)開始時\d+回だけ発動/, Condition.Type.AcStartTimes],
]);

const targetMap = new Map([
  ['-', SkillTarget.None],
  ['', SkillTarget.None],
  ['自信', SkillTarget.Myself],
  ['自身以外', SkillTarget.Friends],
  ['同タイプ', SkillTarget.SameType],
  ['歩夢', SkillTarget.Ayumu],
  ...Object.entries(skillTargetTitleMap).map(([key, value]) => [value, key as SkillTarget] as const),
]);

async function getSkillId(page: puppeteer.Page, index: number) {
  let i = 0;
  let title: any = '';
  let effectStr = '';
  let liveStr = '';
  let conditionStr = '';
  let targetStr = '';
  while (++i < 10) {
    title = await page.evaluate(
      ({ index, i }) =>
        document
          .querySelector(`.entry-body .basic:nth-child(${index}) tbody tr:nth-child(${i}) th`)
          ?.textContent?.trim(),
      { index, i },
    );
    if (!title) {
      continue;
    }
    const value = await page.evaluate(
      ({ index, i }) =>
        document
          .querySelector(`.entry-body .basic:nth-child(${index}) tbody tr:nth-child(${i}) td`)
          ?.textContent?.trim(),
      { index, i },
    );
    if (!value) {
      break;
    }
    switch (title) {
      case '効果種別': {
        effectStr = value;
        break;
      }
      case '種別': {
        liveStr = value;
        break;
      }
      case '条件': {
        conditionStr = value;
        break;
      }
      case '対象': {
        targetStr = value;
        break;
      }
    }
  }
  if (!liveStr) {
    return null;
  }
  const live = liveStr === 'ライブスキル';
  console.info({ live, liveStr, effectStr, conditionStr, targetStr });
  const target = targetMap.get(targetStr);
  const effect =
    effectStr === 'SPゲージ獲得'
      ? target === SkillTarget.None
        ? SkillEffect.SpGaugeGainRate
        : SkillEffect.SpGaugeGainPlus
      : live
      ? liveEffectMap.get(effectStr)
      : passiveEffectMap.get(effectStr);
  const condition = !live
    ? Condition.Type.Passive
    : conditionMap.has(conditionStr)
    ? conditionMap.get(conditionStr)
    : conditionRegexMap.get(Array.from(conditionRegexMap.keys()).find((regex) => regex.test(conditionStr))!);
  if (!effect) {
    throw new Error('Skill effect not found');
  }
  if (!condition) {
    throw new Error('Skill condition not found');
  }
  if (!target) {
    throw new Error('Skill target not found');
  }
  return libs.getSkill(effect, condition, target).id;
}
