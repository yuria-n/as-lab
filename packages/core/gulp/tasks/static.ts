import * as crypto from 'crypto';
import * as fs from 'fs';
import * as gulp from 'gulp';
import * as minimist from 'minimist';
import * as path from 'path';

import { Condition, InspirationSkill, SkillTarget } from '../../entities';
import { getSkillMap } from '../../lib';
import { inspirationSkills, skillTargetTitleMap } from '../../data/masters';

import Rank = InspirationSkill.Rank;

const sourceDir = path.resolve(__dirname, '../../data/json');
const targetDir = path.resolve(__dirname, '../../../web/public/assets/data');
const targets = ['card', 'idol', 'skill', 'inspirationSkill', 'similarText'];

gulp.task('static', async () => {
  const versionMap = {
    version: '0.2.1', // support min version
    maintenance: false,
    ad: {
      reward: 3,
      interval: 4 * 60 * 60 * 1000,
      maxCount: 6,
    },
  };
  for (const target of targets) {
    const fileName = `${target}.json`;
    const sourcePath = path.resolve(sourceDir, fileName);
    const source = target === 'inspirationSkill' ? await parseInspirationSkill() : await import(sourcePath);
    const targetPath = path.resolve(targetDir, fileName);
    const jsonStr = JSON.stringify(source);
    fs.writeFileSync(targetPath, jsonStr);
    versionMap[target] = generateChecksum(jsonStr);
  }
  const targetPath = path.resolve(targetDir, 'config.json');
  fs.writeFileSync(targetPath, JSON.stringify(versionMap));
});

const args = minimist(process.argv);

/**
 * To convert vision text to test code
 * yarn gulp static:read --text '<text>'
 */
gulp.task('static:read', async () => {
  const text = args.t || args.text;
  const codes = text
    .split('')
    .map((char) => char.charCodeAt())
    .flatMap((code) => (code === 10 ? [92, 110] : code)); // \n -> \\n
  console.log(String.fromCharCode(...codes));
});

interface StaticInspirationSkill extends InspirationSkill {
  regex: string;
  slug: string;
}

export const rankMap: Record<Rank, string> = {
  [Rank.None]: '',
  [Rank.Small]: '小',
  [Rank.Medium]: '中',
  [Rank.Large]: '大',
  [Rank.Special]: '特',
  [Rank.Extreme]: '極',
};

function generateChecksum(str: string) {
  return crypto.createHash('md5').update(str, 'utf8').digest('hex');
}

const replaceRegexMap = new Map<string, string>([
  ['アピール', '[アピビ]?.*'],
  ['スタミナ', 'ス.*'],
  ['テクニック', 'ニ.*'],
  ['ボルテージ', 'ルテ.*'],
  ['クリティカル', 'クリ.*'],
  ['シールド', 'シ.*'],
  ['コンボ', 'コ.*'],
  ['特技発動率', '技発.*'],
  ['SP特技', 'SP.*'],
  // ['＋', '[+＋].*'],
  ['UP', 'U.*'],
]);

export const skillTargetShorRegexMap = {
  [SkillTarget.Everyone]: '全.*',
  [SkillTarget.Friends]: '仲.*',
  [SkillTarget.SameGrade]: '年.*',
  [SkillTarget.SameSchool]: '校.*',
  [SkillTarget.SameTeam]: '作.*',
  [SkillTarget.SameType]: 'タイ.*',
  [SkillTarget.SameAttribute]: '属.*',
};

async function parseInspirationSkill(): Promise<StaticInspirationSkill[]> {
  const skillMap = await getSkillMap();
  return inspirationSkills
    .map((inspirationSkill) => {
      const { title } = inspirationSkill;
      if (title) {
        return { ...inspirationSkill, regex: `.*${title}.*`, slug: title };
      }
      const { condition, target, ...skill } = skillMap.get(inspirationSkill.skillId)!;
      let slug = skill.slug;
      let regex = '.*';
      const rank = rankMap[inspirationSkill.rank];
      for (const [re, text] of replaceRegexMap) {
        if (new RegExp(re).test(slug)) {
          regex += text;
        }
      }
      if (rank) {
        slug += ` [${rank}]`;
        regex += `${rank}${inspirationSkill.rank === Rank.Medium ? '?' : ''}.*`;
      }

      let conditionSlug = '';
      switch (condition) {
        case Condition.Type.MusicStart: {
          conditionSlug = '曲開始時';
          regex += '始.*';
          break;
        }
        case Condition.Type.AcStart: {
          conditionSlug = 'AC時';
          regex += 'AC.*';
          break;
        }
        case Condition.Type.AcSuccess: {
          conditionSlug = 'AC成功時';
          regex += 'AC成.*';
          break;
        }
        case Condition.Type.TargetVoltage: {
          conditionSlug = '30％達成時';
          regex += '達.*';
          break;
        }
        case Condition.Type.Stamina: {
          conditionSlug = '残り80％時';
          regex += '残.*';
          break;
        }
      }
      let targetSlug = '';
      if (target !== SkillTarget.None && target !== SkillTarget.Myself) {
        targetSlug = skillTargetTitleMap[target];
        regex += skillTargetShorRegexMap[target] ?? '';
      }
      slug = [slug, [conditionSlug, targetSlug].filter((slug) => slug).join('/')].filter((slug) => slug).join(':');
      return { ...inspirationSkill, regex, slug };
    })
    .sort((s1, s2) => {
      const medium = rankMap[Rank.Medium];
      const m1 = s1.regex.includes(medium);
      const m2 = s2.regex.includes(medium);
      if (m1 !== m2) {
        return m1 ? 1 : -1;
      }

      const appeal = replaceRegexMap.get('アピール')!;
      const a1 = s1.regex.includes(appeal);
      const a2 = s2.regex.includes(appeal);
      if (a1 !== a2) {
        return a1 ? 1 : -1;
      }

      return s2.regex.length - s1.regex.length;
    });
}
