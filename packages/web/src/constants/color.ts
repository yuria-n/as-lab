import { entities } from '@as-lab/core';

// TODO: color should be defined using enum
export type UiColorType = 'white' | 'black' | 'cyan' | 'magenta' | 'yellow' | 'green' | 'red';
enum UiColor {
  White = '#ffffff',
  Black = '#3c3c4b',
  Cyan = '#029fe8',
  Magenta = '#e3027f',
  Yellow = '#f1c809',
  Green = '#17c44e',
  Red = '#E32B0F',
}

// TODO: should use Record with the entity enums
enum DeckColor {
  Red = '#f1556a',
  Green = '#17c44e',
  Blue = '#008df4',
  Sp = '#82d8e6',
}

enum RarityColor {
  Ur1 = '#e3e825',
  Ur2 = '#f690f6',
  Ur3 = '#9feef6',
  Sr1 = '#f8f65a',
  Sr2 = '#efbf2a',
  Sr3 = '#ffd85a',
  R1 = '#c6cde3',
  R2 = '#abb6d8',
  N1 = '#848eae',
}

enum AbilityColor {
  Appeal = '#f680aa',
  Stamina = '#66cc72',
  Technique = '#fac548',
}

enum TypeColor {
  Vo = '#ce3b39',
  Sp = '#268ece',
  Gd = '#3aa15c',
  Sk = '#e3b43c',
}

enum AttributeColor {
  None = '#666666',
  Smile = '#df49a6',
  Pure = '#39a85d',
  Cool = '#0099ee',
  Active = '#db3e3e',
  Natural = '#edbb3e',
  Elegant = '#85519d',
}

export type ColorKey = 100 | 300 | 700 | 900;
export type Color = Partial<Record<ColorKey, string>>;
export type ColorMap<T extends string> = Record<T, Color>;

export const uiColorMap: ColorMap<UiColorType> = {
  white: {
    100: UiColor.White,
  },
  black: {
    100: UiColor.Black,
    300: '#666666',
    700: '#8b9daf',
    900: '#eeeeee',
  },
  cyan: {
    100: UiColor.Cyan,
    300: '#52c7fe',
    700: '#d1f0ff',
    900: '#eaf8ff',
  },
  magenta: {
    100: UiColor.Magenta,
    300: '#fd4eaf',
    700: '#ffe5f3',
    900: '#ffeff8',
  },
  yellow: {
    100: UiColor.Yellow,
    300: '#ffe97e',
    700: '#fff6ca',
    900: '#fffae4',
  },
  green: {
    100: UiColor.Green,
    300: '#adeac1',
    700: '#d5f4df',
    900: '#e7f9ed',
  },
  red: {
    100: UiColor.Red,
  },
};

export const deckColorMap: ColorMap<entities.Deck.Team> = {
  [entities.Deck.Team.Red]: {
    100: DeckColor.Red,
  },
  [entities.Deck.Team.Green]: {
    100: DeckColor.Green,
    300: '#adeac1',
    700: '#d5f4df',
    900: '#e7f9ed',
  },
  [entities.Deck.Team.Blue]: {
    100: DeckColor.Blue,
  },
};

export const spColor: Color = {
  100: DeckColor.Sp,
};

export const abilityColorMap: ColorMap<
  entities.Parameter.Appeal | entities.Parameter.Stamina | entities.Parameter.Technique
> = {
  appeal: {
    100: AbilityColor.Appeal,
  },
  stamina: {
    100: AbilityColor.Stamina,
  },
  technique: {
    100: AbilityColor.Technique,
  },
};

export const attributeColorMap: ColorMap<entities.Card.Attribute> = {
  none: {
    100: AttributeColor.None,
  },
  smile: {
    100: AttributeColor.Smile,
  },
  pure: {
    100: AttributeColor.Pure,
  },
  cool: {
    100: AttributeColor.Cool,
  },
  active: {
    100: AttributeColor.Active,
  },
  natural: {
    100: AttributeColor.Natural,
  },
  elegant: {
    100: AttributeColor.Elegant,
  },
};

export const typeColorMap: ColorMap<entities.Card.Type> = {
  [entities.Card.Type.Vo]: {
    100: TypeColor.Vo,
  },
  [entities.Card.Type.Sp]: {
    100: TypeColor.Sp,
  },
  [entities.Card.Type.Gd]: {
    100: TypeColor.Gd,
  },
  [entities.Card.Type.Sk]: {
    100: TypeColor.Sk,
  },
};

export type Gradient = RarityColor[];

export const gradientMap: Record<entities.Card.Rarity, Gradient> = {
  [entities.Card.Rarity.Ur]: [RarityColor.Ur1, RarityColor.Ur2, RarityColor.Ur3],
  [entities.Card.Rarity.Sr]: [RarityColor.Sr1, RarityColor.Sr2, RarityColor.Sr3],
  [entities.Card.Rarity.R]: [RarityColor.R1, RarityColor.R2, RarityColor.R2],
};

export const IdolColorMap: Record<entities.IdolId, string> = {
  [entities.IdolId.Honoka]: '#FFA336',
  [entities.IdolId.Eri]: '#7AEEFF',
  [entities.IdolId.Kotori]: '#CEBFBF',
  [entities.IdolId.Umi]: '#1769FF',
  [entities.IdolId.Rin]: '#DBD41E',
  [entities.IdolId.Maki]: '#FF503E',
  [entities.IdolId.Nozomi]: '#C455F6',
  [entities.IdolId.Hanayo]: '#6AE673',
  [entities.IdolId.Niko]: '#FF4F91',
  [entities.IdolId.Chika]: '#FF9547',
  [entities.IdolId.Kanan]: '#27C1B7',
  [entities.IdolId.Riko]: '#FF9EAC',
  [entities.IdolId.Dia]: '#DB0839',
  [entities.IdolId.You]: '#66C0FF',
  [entities.IdolId.Yoshiko]: '#C1CAD4',
  [entities.IdolId.Hanamaru]: '#FFD010',
  [entities.IdolId.Mari]: '#C252C6',
  [entities.IdolId.Ruby]: '#FF6FBE',
  [entities.IdolId.Ayumu]: '#FFBFE0',
  [entities.IdolId.Kasumi]: '#D5DE70',
  [entities.IdolId.Shizuku]: '#BBEDFF',
  [entities.IdolId.Karin]: '#4A2FED',
  [entities.IdolId.Ai]: '#FF8246',
  [entities.IdolId.Kanata]: '#BE82FF',
  [entities.IdolId.Setsuna]: '#F60E0E',
  [entities.IdolId.Emma]: '#8FDA79',
  [entities.IdolId.Rina]: '#D0CEE1',
  [entities.IdolId.Shioriko]: '#24BD8B',
  [entities.IdolId.Mia]: '#a9a89a',
  [entities.IdolId.Lanzhu]: '#f69992',
};
