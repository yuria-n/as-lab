import { Card, Deck, Grade, Music, Parameter, School } from '../../entities';
import { DeckSimulator, TeamType } from './simulator';

export interface SimulatorOptions extends DeckSimulator.Options {
  title: string;
  description: string;
  difficulty?: Music.Difficulty;
}

const sblOptions: SimulatorOptions[] = [
  {
    title: '[SBL] Snow halation',
    description:
      'メインは赤作戦のみを想定しています。' +
      'スタミナが十分ある場合、赤作戦の「回復系を含む」のチェックを外したほうがスコアが出るはずです。',
    notes: 166,
    acCount: 4,
    attribute: Card.Attribute.Pure,
    reduction: {
      param: Parameter.Appeal,
      rate: 0,
    },
    grade: Grade.First,
    gradeBonus: 0.2,
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: '[SBL] Fantastic Departure!',
    description: 'メインは赤作戦のみを想定しています。AC中はAquorsが有利になります。',
    notes: 162,
    acCount: 4,
    attribute: Card.Attribute.Elegant,
    grade: Grade.First,
    gradeBonus: 0.2,
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: '[SBL] Cheer for you!!',
    description: 'メインは赤作戦のみを想定しています。',
    notes: 171,
    acCount: 7,
    attribute: Card.Attribute.Natural,
    grade: Grade.First,
    gradeBonus: 0.2,
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
];

const expertOptions: SimulatorOptions[] = [
  {
    title: 'それは僕たちの奇跡（上級＋）',
    description:
      '赤作戦・緑作戦の2メイン編成です。' +
      '赤作戦はアピール重視・緑作戦はSP優先で編成されます。通常時は赤、最初のAC時は緑を使用してみてください。' +
      'もし赤作戦で最初のACが突破できるようでしたら、緑作戦をサポートに変更するとスコアが伸びるはずです。',
    difficulty: Music.Difficulty.Expert,
    notes: 244,
    acCount: 5,
    attribute: Card.Attribute.Smile,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.25,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Voltage,
        defender: true,
        reductions: [
          {
            targets: [Card.Type.Vo],
            param: Parameter.Appeal,
            rate: 0.5,
          },
          {
            targets: [Card.Type.Gd],
            param: Parameter.Appeal,
            rate: 0.5,
          },
          {
            targets: [Card.Type.Sp],
            param: Parameter.Appeal,
            rate: -0.5,
          },
        ],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: '嵐のなかの恋だから（上級＋）',
    description: 'メインは赤作戦のみを想定しています。',
    difficulty: Music.Difficulty.Expert,
    notes: 322,
    acCount: 5,
    attribute: Card.Attribute.Smile,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.25,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'Snow halation（上級＋）',
    description: 'メインは赤作戦のみを想定しています。',
    difficulty: Music.Difficulty.Expert,
    notes: 287,
    acCount: 5,
    attribute: Card.Attribute.Elegant,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.25,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'Music S.T.A.R.T!!（上級＋）',
    description: 'メインは赤作戦のみを想定しています。',
    difficulty: Music.Difficulty.Expert,
    notes: 309,
    acCount: 5,
    attribute: Card.Attribute.Cool,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.25,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: '夏色えがおで1,2,Jump!（上級＋）',
    description: 'メインは赤作戦のみを想定しています。',
    difficulty: Music.Difficulty.Expert,
    notes: 311,
    acCount: 7,
    attribute: Card.Attribute.Elegant,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.25,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: '君のこころは輝いてるかい？（上級＋）',
    description: 'メインは赤作戦のみを想定しています。',
    difficulty: Music.Difficulty.Expert,
    notes: 295,
    acCount: 7,
    attribute: Card.Attribute.Natural,
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [
          {
            targets: [Card.Type.Vo],
            param: Parameter.Appeal,
            rate: 0.35,
          },
          {
            targets: [Card.Type.Sp],
            param: Parameter.Appeal,
            rate: 0.35,
          },
          {
            targets: [Card.Type.Gd],
            param: Parameter.Appeal,
            rate: 0.35,
          },
        ],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: '未来の僕らは知ってるよ（上級＋）',
    description:
      '赤作戦・緑作戦2メイン編成です。体力に余裕がある場合は、1メイン編成の方がよりスコアが伸びる可能性があります。' +
      '赤作戦はアピール＋SP特化・緑作戦はガード優先で編成されます。最初のAC時・アピール50%減少時は緑作戦に切り替えると良さそうです。' +
      '緑ゲージをキープしましょう。黄ゲージになってしまう方は回復を多めに連れて行くと良いと思います。',
    difficulty: Music.Difficulty.Expert,
    notes: 268,
    acCount: 4,
    attribute: Card.Attribute.Smile,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.25,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: false,
        reductions: [
          {
            targets: [Card.Type.Vo],
            param: Parameter.Appeal,
            rate: -0.5,
          },
          {
            targets: [Card.Type.Sp],
            param: Parameter.Appeal,
            rate: -0.5,
          },
        ],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Voltage,
        defender: true,
        reductions: [
          {
            targets: [Card.Type.Vo],
            param: Parameter.Appeal,
            rate: 1,
          },
          {
            targets: [Card.Type.Sp],
            param: Parameter.Appeal,
            rate: 1,
          },
          {
            targets: [Card.Type.Sk],
            param: Parameter.Appeal,
            rate: 1,
          },
        ],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: '青空Jumping Heart（上級＋）',
    description:
      'メインは赤作戦のみを想定していますが、アピール50%減少ノーツ出現時に作戦切替が必要です。' +
      'Aqoursのメンバーを増やすとスコアが伸びる可能性があります。',
    difficulty: Music.Difficulty.Expert,
    notes: 264,
    acCount: 6,
    attribute: Card.Attribute.Pure,
    reduction: {
      param: Parameter.Appeal,
      rate: 0,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'スリリング・ワンウェイ（上級＋）',
    description: 'メインは赤作戦のみを想定しています。Aqours以外の基本アピールが25%減少します。',
    difficulty: Music.Difficulty.Expert,
    notes: 282,
    acCount: 7,
    attribute: Card.Attribute.Elegant,
    reduction: {
      param: Parameter.Appeal,
      rate: 0,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Voltage,
        defender: true,
        reductions: [
          {
            targets: [Card.Type.Vo],
            param: Parameter.Appeal,
            rate: 0.5,
          },
          {
            targets: [Card.Type.Sk],
            param: Parameter.Appeal,
            rate: 0.5,
          },
          {
            targets: [Card.Type.Sp],
            param: Parameter.Appeal,
            rate: 0.5,
          },
        ],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'Sweet Eyes（上級＋）',
    description: 'メインは赤作戦のみを想定しています。',
    difficulty: Music.Difficulty.Expert,
    notes: 280,
    acCount: 5,
    attribute: Card.Attribute.Cool,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.25,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [
          {
            targets: [Card.Type.Vo],
            param: Parameter.Appeal,
            rate: 0.25,
          },
          {
            targets: [Card.Type.Sk],
            param: Parameter.Appeal,
            rate: 0.25,
          },
          {
            targets: [Card.Type.Gd],
            param: Parameter.Appeal,
            rate: 0.25,
          },
        ],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: '全速ドリーマー（上級＋）',
    description: 'メインは赤作戦のみを想定しています。ニジガクのメンバーを増やすとスコアが伸びる可能性があります。',
    difficulty: Music.Difficulty.Expert,
    notes: 285,
    acCount: 7,
    attribute: Card.Attribute.Active,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.25,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'TOKIMEKI Runners（上級＋）',
    description:
      '赤作戦・緑作戦の2メイン編成です。' +
      '赤作戦はアピール重視・緑作戦はガード優先で編成されます。通常時は赤、最初のAC時は緑を使用してみてください。',
    difficulty: Music.Difficulty.Expert,
    notes: 261,
    acCount: 6,
    attribute: Card.Attribute.Smile,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.25,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Voltage,
        defender: true,
        reductions: [
          {
            targets: [Card.Type.Vo],
            param: Parameter.Appeal,
            rate: 0.5,
          },
          {
            targets: [Card.Type.Sk],
            param: Parameter.Appeal,
            rate: 0.5,
          },
          {
            targets: [Card.Type.Sp],
            param: Parameter.Appeal,
            rate: 0.5,
          },
        ],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'Love U my friends（上級＋）',
    description: 'メインは赤作戦のみを想定しています。虹学以外の基本アピールが25%減少します。',
    difficulty: Music.Difficulty.Expert,
    notes: 301,
    acCount: 7,
    attribute: Card.Attribute.Smile,
    reduction: {
      param: Parameter.Appeal,
      rate: 0,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
];

const hardOptions: SimulatorOptions[] = [
  {
    title: '僕たちはひとつの光',
    description:
      'メインは赤作戦のみを想定しています。' + "全員の基本アピール50%減少し、AC中にμ'sが有利になる特殊効果があります。",
    notes: 178,
    acCount: 6,
    attribute: Card.Attribute.Smile,
    reduction: {
      param: Parameter.Appeal,
      rate: 0,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: '元気全開DAY!DAY!DAY!',
    description: 'メインは赤作戦のみを想定しています。',
    notes: 176,
    acCount: 4,
    attribute: Card.Attribute.Natural,
    reduction: {
      param: Parameter.SkillInvocation,
      rate: 0.5,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'NEO SKY, NEO MAP!',
    description:
      'メインは赤作戦のみを想定しています。' +
      '全員の基本アピールが20%減少し、AC中はニジガクのみ有利な特殊効果があります。',
    notes: 167,
    acCount: 5,
    attribute: Card.Attribute.Pure,
    reduction: {
      param: Parameter.Appeal,
      rate: 0,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'I’m Still...',
    description: 'メインは赤作戦のみを想定しています。SPタイプが多いほど有利になる特殊効果があります。',
    difficulty: Music.Difficulty.Hard,
    notes: 169,
    acCount: 6,
    attribute: Card.Attribute.Pure,
    reduction: {
      param: Parameter.Appeal,
      rate: 0,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'タカラモノズ',
    description: "メインは赤作戦のみを想定しています。μ's以外の基本アピールが20%減少します。",
    notes: 172,
    acCount: 6,
    attribute: Card.Attribute.Pure,
    reduction: {
      targets: [School.Aqua, School.Niji],
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'WATER BLUE NEW WORLD',
    description: 'メインは赤作戦のみを想定しています。',
    notes: 178,
    acCount: 6,
    attribute: Card.Attribute.Elegant,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'Margaret',
    description: 'メインは赤作戦のみを想定しています。ガードタイプとSPタイプ以外のアピールが20%減少します。',
    notes: 168,
    acCount: 6,
    attribute: Card.Attribute.Smile,
    reduction: {
      targets: [Card.Type.Vo, Card.Type.Sk],
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'KiRa-KiRa Sensation!',
    description: 'メインは赤作戦のみを想定しています。SPタイプ以外の基本SPゲージ獲得量が50%低下します。',
    difficulty: Music.Difficulty.Hard,
    notes: 184,
    acCount: 4,
    attribute: Card.Attribute.Pure,
    reduction: {
      param: Parameter.Appeal,
      rate: 0,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'Märchen Star',
    description:
      'メインは赤作戦のみを想定しています。ボルテージタイプとスキルタイプ以外の基本アピールが20%減少します。',
    difficulty: Music.Difficulty.Hard,
    notes: 178,
    acCount: 4,
    attribute: Card.Attribute.Natural,
    reduction: {
      param: Parameter.Appeal,
      rate: 0,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'Happy maker!',
    description: 'メインは赤作戦のみを想定しています。',
    notes: 191,
    acCount: 7,
    attribute: Card.Attribute.Active,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: '未熟DREAMER',
    description: 'メインは赤作戦のみを想定しています。シールドを貫通するダメージに注意してください。',
    notes: 158,
    acCount: 4,
    attribute: Card.Attribute.Elegant,
    reduction: {
      param: Parameter.Appeal,
      rate: 0,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'LIKE IT！LOVE IT！',
    description: 'メインは赤作戦のみを想定しています。SPタイプとスキルタイプが有利になるギミックがあります。',
    notes: 186,
    acCount: 7,
    attribute: Card.Attribute.Cool,
    reduction: {
      param: Parameter.Appeal,
      rate: 0,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [
          {
            targets: [Card.Type.Vo],
            param: Parameter.Appeal,
            rate: 0.2,
          },
          {
            targets: [Card.Type.Gd],
            param: Parameter.Appeal,
            rate: 0.2,
          },
        ],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [
          {
            targets: [Card.Type.Vo],
            param: Parameter.Appeal,
            rate: 0.2,
          },
          {
            targets: [Card.Type.Gd],
            param: Parameter.Appeal,
            rate: 0.2,
          },
        ],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [
          {
            targets: [Card.Type.Vo],
            param: Parameter.Appeal,
            rate: 0.2,
          },
          {
            targets: [Card.Type.Gd],
            param: Parameter.Appeal,
            rate: 0.2,
          },
        ],
      },
    ],
  },
  {
    title: 'TOKIMEKI Runners 17章Ver.',
    description: 'メインは赤作戦のみを想定しています。',
    notes: 145,
    acCount: 4,
    attribute: Card.Attribute.Natural,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'Love U my friends',
    description: 'メインは赤作戦のみを想定しています。',
    notes: 179,
    acCount: 5,
    attribute: Card.Attribute.Smile,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'L！L！L！（Love the Life We Live）',
    description: 'メインは赤作戦のみを想定しています。',
    notes: 176,
    acCount: 7,
    attribute: Card.Attribute.Elegant,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: '微熱からMystery',
    description: 'メインは赤作戦のみを想定しています。',
    notes: 175,
    acCount: 5,
    attribute: Card.Attribute.Cool,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'GALAXY HidE and SeeK',
    description:
      'メインは赤作戦のみを想定しています。作戦切替時に発動する効果を個性に持つSPタイプを増やしてみたり、2メイン編成にするとよりスコアがでる可能性があります。',
    notes: 165,
    acCount: 4,
    attribute: Card.Attribute.Pure,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'Fire Bird',
    description:
      'メインは赤作戦のみを想定しています。サブに減少効果解除のアイドルを編成するとよりスコアが伸びる可能性があります。',
    notes: 162,
    acCount: 4,
    attribute: Card.Attribute.Elegant,
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [
          {
            targets: [Card.Type.Sp],
            param: Parameter.Appeal,
            rate: 0.2,
          },
          {
            targets: [Card.Type.Sk],
            param: Parameter.Appeal,
            rate: 0.2,
          },
        ],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [
          {
            targets: [Card.Type.Sp],
            param: Parameter.Appeal,
            rate: 0.2,
          },
          {
            targets: [Card.Type.Sk],
            param: Parameter.Appeal,
            rate: 0.2,
          },
        ],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [
          {
            targets: [Card.Type.Sp],
            param: Parameter.Appeal,
            rate: 0.2,
          },
          {
            targets: [Card.Type.Sk],
            param: Parameter.Appeal,
            rate: 0.2,
          },
        ],
      },
    ],
  },
  {
    title: 'Wonder zone',
    description:
      'メインは赤作戦のみを想定しています。' +
      '赤作戦の「回復系を含む」のチェックを外したり、SPタイプをメイン作戦に編成するとスコアが伸びる可能性があります。',
    notes: 173,
    acCount: 6,
    attribute: Card.Attribute.Natural,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'Brightest Melody',
    description:
      'メインは赤作戦のみを想定しています。' +
      '赤作戦の「回復系を含む」のチェックを外したり、Aqoursのスクールアイドルをメイン作戦に編成するとスコアが伸びる可能性があります。',
    notes: 174,
    acCount: 4,
    attribute: Card.Attribute.Smile,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'めっちゃGoing!!',
    description:
      'メインは赤作戦のみを想定しています。サブに減少効果解除のアイドルを編成するとよりスコアが伸びる可能性があります。',
    notes: 149,
    acCount: 4,
    attribute: Card.Attribute.Active,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.1,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: '未来の僕らは知ってるよ',
    description:
      'メインは赤作戦のみを想定しています。サブに減少効果解除のアイドルを編成するとよりスコアが伸びる可能性があります。',
    notes: 156,
    acCount: 4,
    attribute: Card.Attribute.Smile,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.15,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'HAPPY PARTY TRAIN',
    description:
      'メインは赤作戦のみを想定しています。サブに減少効果解除のアイドルを編成するとよりスコアが伸びる可能性があります。',
    notes: 176,
    acCount: 5,
    attribute: Card.Attribute.Pure,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: '夏色えがおで1,2,Jump!',
    description:
      'メインは赤作戦のみを想定しています。サブに減少効果解除のアイドルを編成するとよりスコアが伸びる可能性があります。',
    notes: 193,
    acCount: 4,
    attribute: Card.Attribute.Elegant,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'MIRAI TICKET',
    description: 'メインは赤作戦のみを想定しています。',
    notes: 189,
    acCount: 6,
    attribute: Card.Attribute.Natural,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'Music S.T.A.R.T!!',
    description: 'メインは赤作戦のみを想定しています。スタミナダメージのノーツあります。',
    notes: 174,
    acCount: 5,
    attribute: Card.Attribute.Cool,
    gradeBonus: 0.2,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: '君のこころは輝いてるかい？',
    description:
      'メインは赤作戦のみを想定しています。サブに減少効果解除のアイドルを編成するとよりスコアが伸びる可能性があります。',
    notes: 150,
    acCount: 4,
    attribute: Card.Attribute.Natural,
    gradeBonus: 0.2,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.1,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'Beautiful Moonlight',
    description:
      'メインは赤作戦のみを想定しています。サブに減少効果解除のアイドルを編成するとよりスコアが伸びる可能性があります。',
    notes: 171,
    acCount: 5,
    attribute: Card.Attribute.Elegant,
    gradeBonus: 0.2,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'もぎゅっと“love”で接近中!',
    description: 'メインは赤作戦のみを想定しています。',
    notes: 186,
    acCount: 4,
    attribute: Card.Attribute.Smile,
    reduction: {
      param: Parameter.Appeal,
      rate: 0,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [
          {
            targets: [Card.Type.Vo],
            param: Parameter.Appeal,
            rate: 0.15,
          },
          {
            targets: [Card.Type.Gd],
            param: Parameter.Appeal,
            rate: 0.15,
          },
          {
            targets: [Card.Type.Sp],
            param: Parameter.Appeal,
            rate: 0.15,
          },
          {
            targets: [Card.Type.Sk],
            param: Parameter.Appeal,
            rate: 0.15,
          },
        ],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'Strawberry Trapper',
    description: 'メインは赤作戦のみを想定しています。',
    notes: 169,
    acCount: 5,
    attribute: Card.Attribute.Active,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.05,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: '楽しいの天才',
    description:
      'メインは赤作戦のみを想定しています。サブに減少効果解除のアイドルを編成するとよりスコアが伸びる可能性があります。' +
      'また、スキルとガードタイプが有利になるギミックがあります。',
    notes: 167,
    acCount: 5,
    attribute: Card.Attribute.Cool,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.25,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'Just Believe!!!',
    description:
      'メインは赤作戦のみを想定しています。サブに減少効果解除のアイドルを編成するとよりスコアが伸びる可能性があります。' +
      'また、SPタイプが有利になるギミックがあります。',
    notes: 180,
    acCount: 3,
    attribute: Card.Attribute.Natural,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: '虹色Passions！',
    description: 'メインは赤作戦のみを想定しています。ニジガクが有利になるギミックがあります。',
    notes: 173,
    acCount: 4,
    attribute: Card.Attribute.Active,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'No brand girls',
    description:
      'メインは赤作戦のみを想定しています。サブに減少効果解除のアイドルを編成するとよりスコアが伸びる可能性があります。' +
      'Skを増やしたい場合、緑作戦の作戦タイプを「テクニック」に変更して、' +
      '効果にボルテージ、SP、スキルタイプのテクニックを100%減少を追加してみてください。',
    notes: 171,
    acCount: 4,
    attribute: Card.Attribute.Elegant,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: '近未来ハッピーエンド',
    description: 'メインは赤作戦のみを想定しています。',
    notes: 184,
    acCount: 5,
    attribute: Card.Attribute.Natural,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: '眠れる森に行きたいな',
    description:
      'メインは赤作戦のみを想定しています。サブに減少効果解除のアイドルを編成するとよりスコアが伸びる可能性があります。',
    notes: 129,
    acCount: 5,
    attribute: Card.Attribute.Pure,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.1,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'オードリー',
    description: 'メインは赤作戦のみを想定しています。',
    notes: 157,
    acCount: 4,
    attribute: Card.Attribute.Elegant,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'SKY JOURNEY',
    description:
      'メインは赤作戦のみを想定しています。Skタイプのアイドルを編成すると、よりスコアが伸びる可能性があります。',
    notes: 158,
    acCount: 5,
    attribute: Card.Attribute.Natural,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'HEART to HEART!',
    description:
      "メインは赤作戦のみを想定しています。サブに減少効果解除や、メインにμ'sのアイドルを編成するとよりスコアが伸びる可能性があります。",
    notes: 184,
    acCount: 5,
    attribute: Card.Attribute.Smile,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'COLORFUL VOICE',
    description:
      'メインは赤作戦のみを想定しています。' +
      'スタミナが十分ある場合、赤作戦の「回復系を含む」のチェックを外したほうがスコアが出るはずです。',
    notes: 185,
    acCount: 4,
    attribute: Card.Attribute.Cool,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [
          {
            targets: [Card.Type.Vo],
            param: Parameter.Appeal,
            rate: 0.1,
          },
          {
            targets: [Card.Type.Sp],
            param: Parameter.Appeal,
            rate: -0.1,
          },
        ],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: '友 & 愛',
    description:
      'メインは赤作戦のみを想定しています。' +
      'スタミナが十分ある場合、赤作戦の「回復系を含む」のチェックを外したほうがスコアが出るはずです。',
    notes: 170,
    acCount: 4,
    attribute: Card.Attribute.Smile,
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [
          {
            targets: [Card.Type.Gd],
            param: Parameter.Appeal,
            rate: 0.1,
          },
          {
            targets: [Card.Type.Sp],
            param: Parameter.Appeal,
            rate: 0.1,
          },
          {
            targets: [Card.Type.Sk],
            param: Parameter.Appeal,
            rate: 0.1,
          },
        ],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'START:DASH!!',
    description:
      'メインは赤作戦のみを想定しています。' +
      'スタミナが十分ある場合、赤作戦の「回復系を含む」のチェックを外したほうがスコアが出るはずです。',
    notes: 169,
    acCount: 4,
    attribute: Card.Attribute.Natural,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.1,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'コワレヤスキ',
    description: 'メインは赤作戦のみを想定しています。' + 'ダメージ量に合わせて、ガードタイプを増やしてみてください。',
    notes: 162,
    acCount: 6,
    attribute: Card.Attribute.Cool,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: '☆ワンダーランド☆',
    description:
      'メインは赤作戦のみを想定しています。' +
      'スタミナが十分ある場合、赤作戦の「回復系を含む」のチェックを外したほうがスコアが出るはずです。',
    notes: 182,
    acCount: 6,
    attribute: Card.Attribute.Active,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [
          {
            targets: [Card.Type.Gd],
            param: Parameter.Appeal,
            rate: 0.15,
          },
          {
            targets: [Card.Type.Sp],
            param: Parameter.Appeal,
            rate: 0.15,
          },
          {
            targets: [Card.Type.Sk],
            param: Parameter.Appeal,
            rate: 0.15,
          },
        ],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'Snow halation',
    description:
      'メインは赤作戦のみを想定しています。' +
      'スタミナが十分ある場合、赤作戦の「回復系を含む」のチェックを外したほうがスコアが出るはずです。',
    notes: 166,
    acCount: 4,
    attribute: Card.Attribute.Pure,
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'Landing action Yeah!!',
    description: 'メインは赤作戦のみを想定しています。',
    notes: 174,
    acCount: 5,
    attribute: Card.Attribute.Cool,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [
          {
            targets: [Card.Type.Sp],
            param: Parameter.Appeal,
            rate: 0.1,
          },
          {
            targets: [Card.Type.Sk],
            param: Parameter.Appeal,
            rate: 0.1,
          },
        ],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: '開花宣言',
    description: 'メインは赤作戦のみを想定しています。ガードタイプを入れると、スコアが伸びる可能性があります。',
    notes: 176,
    acCount: 6,
    attribute: Card.Attribute.Pure,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.15,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'それは僕たちの奇跡',
    description:
      'メインは赤作戦のみを想定しています。' +
      'スタミナが十分ある場合、赤作戦の「回復系を含む」のチェックを外したほうがスコアが出るはずです。',
    notes: 152,
    acCount: 3,
    attribute: Card.Attribute.Smile,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.15,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'あなたの理想のヒロイン',
    description:
      'メインは赤作戦のみを想定しています。' +
      'スタミナが十分ある場合、赤作戦の「回復系を含む」のチェックを外したほうがスコアが出るはずです。',
    notes: 135,
    acCount: 4,
    attribute: Card.Attribute.Elegant,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.1,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: '恋になりたいAQUARIUM',
    description:
      '赤作戦・緑作戦の2メイン編成です。' +
      '赤作戦はVo優先・緑作戦はGd優先で編成されます。1~3回目のAC時は緑、それ以外は赤を使用してみてください。' +
      'スタミナが十分ある場合、赤作戦の「回復系を含む」のチェックを外したほうがスコアが出るはずです。',
    notes: 176,
    acCount: 4,
    attribute: Card.Attribute.Cool,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Voltage,
        defender: true,
        reductions: [
          {
            targets: [Card.Type.Vo],
            param: Parameter.Appeal,
            rate: 1,
          },
          {
            targets: [Card.Type.Sp],
            param: Parameter.Appeal,
            rate: 1,
          },
          {
            targets: [Card.Type.Sk],
            param: Parameter.Appeal,
            rate: 1,
          },
        ],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'TOKIMEKI Runners',
    description: 'メインは赤作戦のみを想定しています。',
    notes: 145,
    acCount: 3,
    attribute: Card.Attribute.Smile,
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'PSYCHIC FIRE',
    description: 'メインは赤作戦のみを想定しています。',
    notes: 164,
    acCount: 4,
    attribute: Card.Attribute.Active,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.05,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'Wake up, Challenger!!',
    description: 'メインは赤作戦のみを想定しています。',
    notes: 178,
    acCount: 5,
    attribute: Card.Attribute.Cool,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [
          {
            targets: [Card.Type.Vo],
            param: Parameter.Appeal,
            rate: -0.3,
          },
          {
            targets: [Card.Type.Gd],
            param: Parameter.Appeal,
            rate: -0.2,
          },
          {
            targets: [Card.Type.Sp],
            param: Parameter.Appeal,
            rate: -0.1,
          },
        ],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'LOVELESS WORLD（Vo特化）',
    description:
      'メインは赤作戦のみを想定しています。ACでシールド・回復を獲得するため、回復なしのVo特化になっています。' +
      '黄色ゲージになってしまう場合はVo優先を試してみてください。',
    notes: 186,
    acCount: 5,
    attribute: Card.Attribute.Smile,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: false,
        reductions: [
          {
            targets: [Card.Type.Vo],
            param: Parameter.Appeal,
            rate: -0.2,
          },
        ],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: 'LOVELESS WORLD（Vo優先）',
    description: 'メインは赤作戦のみを想定しています。回復ありのバランス型になっています。',
    notes: 186,
    acCount: 5,
    attribute: Card.Attribute.Smile,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [
          {
            targets: [Card.Type.Vo],
            param: Parameter.Appeal,
            rate: -0.2,
          },
        ],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
    ],
  },
  {
    title: '哀温ノ詩（Vo優先＋Sk）',
    description:
      '赤作戦・緑作戦の2メイン編成です。' +
      '赤作戦はVo重視・緑作戦はSk重視になっています。特技ACには緑作戦を使用してみてください。',
    notes: 130,
    acCount: 4,
    attribute: Card.Attribute.Pure,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.4,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Voltage,
        defender: true,
        reductions: [
          {
            targets: [Card.Type.Sk],
            param: Parameter.Appeal,
            rate: -1.0,
          },
        ],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'ユメノトビラ',
    description:
      '赤作戦・緑作戦の2メイン編成です。' +
      '赤作戦はアピール重視・緑作戦はSP重視で編成され、通常時は赤・AC時は緑を使用してみてください。' +
      'アピール減少時にも一度緑に切り替えて減少効果を解除することをオススメします。',
    notes: 172,
    acCount: 4,
    attribute: Card.Attribute.Pure,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      { team: Deck.Team.Red, type: TeamType.Voltage, defender: true, reductions: [] },
      {
        team: Deck.Team.Green,
        type: TeamType.Voltage,
        defender: true,
        reductions: [
          {
            targets: [Card.Type.Vo],
            param: Parameter.Appeal,
            rate: 0.5,
          },
          {
            targets: [Card.Type.Sk],
            param: Parameter.Appeal,
            rate: 0.5,
          },
          {
            targets: [Card.Type.Gd],
            param: Parameter.Appeal,
            rate: 0.5,
          },
        ],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'Step! ZERO to ONE',
    description:
      '赤作戦・緑作戦の2メイン編成です。' +
      '赤作戦はアピール重視・緑作戦はガード重視で編成され、通常時は赤・ダメージ時、4回目のAC時は緑作戦を使用してみてください。' +
      'また、ガードタイプをあまりお持ちでない方・アピール補正が高い方はこのオプションを指定しないほうがスコアが出る可能性があります。',
    notes: 180,
    acCount: 5,
    attribute: Card.Attribute.Active,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.2,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [
          {
            targets: [Card.Type.Sp],
            param: Parameter.Appeal,
            rate: 0.5,
          },
          {
            targets: [Card.Type.Sk],
            param: Parameter.Appeal,
            rate: 0.5,
          },
          {
            targets: [Card.Type.Gd],
            param: Parameter.Appeal,
            rate: 0.5,
          },
        ],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Voltage,
        defender: true,
        reductions: [
          {
            targets: [Card.Type.Vo],
            param: Parameter.Appeal,
            rate: 0.5,
          },
          {
            targets: [Card.Type.Sp],
            param: Parameter.Appeal,
            rate: 0.5,
          },
          {
            targets: [Card.Type.Sk],
            param: Parameter.Appeal,
            rate: 0.5,
          },
        ],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
  {
    title: 'LIKE IT! LOVE IT!',
    description:
      '赤作戦・緑作戦の2メイン編成です。' +
      '赤作戦はSk優先・緑作戦はSp優先で編成されます。1,3,6回目のAC時は赤、それ以外は緑を使用してみてください。',
    notes: 186,
    acCount: 7,
    attribute: Card.Attribute.Cool,
    reduction: {
      param: Parameter.Appeal,
      rate: 0,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: false,
        reductions: [
          {
            targets: [Card.Type.Vo],
            param: Parameter.Appeal,
            rate: 0.2 + 0.5,
          },
          {
            targets: [Card.Type.Gd],
            param: Parameter.Appeal,
            rate: 0.2 + 0.5,
          },
          {
            targets: [Card.Type.Sp],
            param: Parameter.Appeal,
            rate: 0.5,
          },
        ],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Voltage,
        defender: true,
        reductions: [
          {
            targets: [Card.Type.Vo],
            param: Parameter.Appeal,
            rate: 0.2 + 0.5,
          },
          {
            targets: [Card.Type.Gd],
            param: Parameter.Appeal,
            rate: 0.2 + 0.5,
          },
          {
            targets: [Card.Type.Sk],
            param: Parameter.Appeal,
            rate: 0.5,
          },
        ],
      },
      {
        team: Deck.Team.Blue,
        type: TeamType.Support,
        target: Deck.Team.Green,
        reductions: [
          {
            targets: [Card.Type.Vo],
            param: Parameter.Appeal,
            rate: 0.2,
          },
          {
            targets: [Card.Type.Gd],
            param: Parameter.Appeal,
            rate: 0.2,
          },
        ],
      },
    ],
  },
  {
    title: '青空Jumping Heart',
    description: 'メインは赤作戦のみを想定しています。',
    notes: 143,
    acCount: 4,
    attribute: Card.Attribute.Pure,
    reduction: {
      param: Parameter.Appeal,
      rate: 0.15,
    },
    teams: [
      {
        team: Deck.Team.Red,
        type: TeamType.Voltage,
        defender: true,
        reductions: [],
      },
      {
        team: Deck.Team.Green,
        type: TeamType.Support,
        target: Deck.Team.Red,
        reductions: [],
      },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
  },
];

export const presetSimulationOptions: SimulatorOptions[] = [...sblOptions, ...expertOptions, ...hardOptions];
