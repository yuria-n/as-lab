import { config } from '../config';

export enum Path {
  Home = '/',
  Card = '/cards',
  Accessory = '/accessories',
  Deck = '/decks',
  Kizuna = '/kizunas',
  Gacha = '/gachas',
  Friend = '/friends',
  Library = '/libraries',
  Skill = '/skills',
  InspirationSkill = '/inspirationSkills',
  About = '/about',
  New = '/new',
  Simulator = '/simulators',
  Music = '/musics',
  Mypage = '/mypage',
  Reference = '/reference',
  Support = '/supports',
}

export const titleMap: Record<Path, string> = {
  [Path.Home]: '編成',
  [Path.Card]: 'カード',
  [Path.Accessory]: 'アクセサリー',
  [Path.Deck]: 'ライブ編成',
  [Path.Kizuna]: 'キズナボード',
  [Path.Gacha]: 'ガチャ',
  [Path.Friend]: 'フレンド',
  [Path.Library]: 'ライブラリー',
  [Path.Skill]: 'スキル',
  [Path.InspirationSkill]: 'ひらめきスキル',
  [Path.Simulator]: 'シミュレーター',
  [Path.Music]: '楽曲',
  [Path.About]: 'about',
  [Path.New]: '新規作成',
  [Path.Mypage]: 'マイページ',
  [Path.Reference]: 'スペシャルサンクス',
  [Path.Support]: 'サポート',
};

export interface Link {
  href: string;
  title: string;
  feature: boolean;
}

export const filterLinks = (links: Link[]) => links.filter((link) => config.feature || !link.feature);

export const links: Link[] = filterLinks([
  {
    href: `${Path.Simulator}${Path.Deck}`,
    title: titleMap[Path.Home],
    feature: false,
  },
  {
    href: `${Path.Simulator}${Path.Music}`,
    title: titleMap[Path.Music],
    feature: false,
  },
  {
    href: Path.Gacha,
    title: titleMap[Path.Gacha],
    feature: false,
  },
  {
    href: Path.Library,
    title: titleMap[Path.Library],
    feature: false,
  },
  {
    href: Path.Mypage,
    title: titleMap[Path.Mypage],
    feature: false,
  },
]);

export const mypageLinks: Link[] = filterLinks([
  {
    href: `${Path.Mypage}${Path.Deck}`,
    title: titleMap[Path.Deck],
    feature: false,
  },
  {
    href: `${Path.Mypage}${Path.Card}`,
    title: titleMap[Path.Card],
    feature: false,
  },
  {
    href: `${Path.Mypage}${Path.Accessory}`,
    title: titleMap[Path.Accessory],
    feature: false,
  },
  {
    href: `${Path.Mypage}${Path.Kizuna}`,
    title: titleMap[Path.Kizuna],
    feature: false,
  },
  {
    href: `${Path.Mypage}${Path.Friend}`,
    title: titleMap[Path.Friend],
    feature: false,
  },
]);

export const libraryLinks: Link[] = filterLinks([
  {
    href: `${Path.Library}${Path.Card}`,
    title: `${titleMap[Path.Card]}一覧`,
    feature: false,
  },
  {
    href: `${Path.Library}${Path.InspirationSkill}`,
    title: `${titleMap[Path.InspirationSkill]}一覧`,
    feature: false,
  },
]);

export const deckSimulatorLinks: Link[] = filterLinks([
  {
    href: `${Path.Simulator}${Path.Deck}`,
    title: titleMap[Path.Deck],
    feature: false,
  },
  {
    href: `${Path.Simulator}${Path.Deck}${Path.Support}`,
    title: titleMap[Path.Support],
    feature: false,
  },
]);
