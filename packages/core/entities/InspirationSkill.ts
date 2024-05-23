import { CardSkill } from './BaseSkill';

export interface InspirationSkill extends CardSkill {
  id: Id;
  title: Title;
  rarity: InspirationSkill.Rarity;
  rank: InspirationSkill.Rank;
  places: InspirationSkill.Place[];
}

export namespace InspirationSkill {
  export enum Rarity {
    N = 'N',
    NR = 'NR',
    R = 'R',
    SR = 'SR',
    UR = 'UR',
  }

  export enum Rank {
    None = 'none',
    Small = 'small',
    Medium = 'medium',
    Large = 'large',
    Special = 'special',
    Extreme = 'extreme',
  }

  export enum Place {
    Running = 'running',
    Leaflet = 'leaflet',
    Meditation = 'meditation',
    Dance = 'dance',
    Voice = 'voice',
    PushUp = 'pushUp',
    Stretch = 'stretch',
    Swim = 'swim',
    // event
    Summer = 'summer',
  }
}
