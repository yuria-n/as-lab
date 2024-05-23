import * as assert from 'assert';

import { Card, Deck, Parameter, UserCard, UserIdol } from '../../../entities';
import { DeckSimulator, TeamType, getSkillMap } from '../../../lib';
import { groupBy, times, uniqBy } from '../../../utils';
import { masters } from '../../../data';
import { userCards } from '../data/userCards';
import { userIdols } from '../musics/data';

describe('Simulator', () => {
  const skillMap = getSkillMap();
  class TestSimulator {
    private idols = masters.idols;
    private cards = masters.cards;
    private skillMap = skillMap;
    private conditions = masters.conditions;
    private inspirationSkills = masters.inspirationSkills;
    private kizunaSkills = masters.kizunaSkills;
    private userCards = userCards;
    private userIdols = userIdols;
    private options: DeckSimulator.Options;
    setUserCards(userCards: UserCard[]) {
      this.userCards = userCards;
      return this;
    }
    setUserIdols(userIdols: UserIdol[]) {
      this.userIdols = userIdols;
      return this;
    }
    setOptions(options: DeckSimulator.Options) {
      this.options = options;
      return this;
    }
    simulate() {
      return new DeckSimulator(
        this.idols,
        this.cards,
        this.skillMap,
        this.conditions,
        this.inspirationSkills,
        this.kizunaSkills,
        this.userIdols,
        this.userCards,
        this.options,
      ).simulate();
    }
  }

  describe('simulate', () => {
    it('should have 9 cards', () => {
      const deckCards = new TestSimulator().simulate();
      assert.strictEqual(deckCards.length, 9);
    });

    it('should have unique cards', () => {
      const deckCards = new TestSimulator().simulate();
      assert.strictEqual(uniqBy(deckCards, (deck) => deck.cardId).length, 9);
    });

    it('should work when sp team has some of main team', () => {
      const deckCards = new TestSimulator()
        .setOptions({
          attribute: Card.Attribute.Smile,
        })
        .simulate();
      assert.strictEqual(uniqBy(deckCards, (deck) => deck.cardId).length, 9);
    });

    it('should have 3 teams', () => {
      const deckCards = new TestSimulator().simulate();
      const teamMap = groupBy(deckCards, (card) => card.team);
      for (const team of Object.values(Deck.Team)) {
        assert.strictEqual(teamMap.get(team)?.length, 3, `team: ${team}`);
      }
    });

    it('should include the highest appeal card', () => {
      const deckCards = new TestSimulator().simulate();
      assert.ok(deckCards.map(({ cardId }) => cardId).includes('112'));
    });

    it('should not include 241', () => {
      const deckCards = new TestSimulator().simulate();
      assert.ok(!deckCards.map(({ cardId }) => cardId).includes('241'));
    });

    it('should arrange pre-registered card order', () => {
      const deckCard: Deck.Card = { cardId: '18', team: Deck.Team.Red };
      const deckCards: DeckSimulator.Options['deckCards'] = [null, null, null, null, null, null, null, null, null];
      const simulator = new TestSimulator();
      times(9, (index) => {
        deckCards[index] = deckCard;
        const cards = simulator.setOptions({ deckCards }).simulate();
        assert.strictEqual(cards[index], deckCard);
        deckCards[index] = null;
      });
    });

    it('should have 3 teams with pre-registered card', () => {
      const deckCard = { cardId: '18', team: Deck.Team.Green };
      const deckCards: DeckSimulator.Options['deckCards'] = [null, null, null, null, null, null, null, null, null];
      const simulator = new TestSimulator();
      times(9, (index) => {
        deckCards[index] = deckCard;
        const cards = simulator.setOptions({ deckCards }).simulate();
        const teamMap = groupBy(cards, (card) => card.team);
        for (const team of Object.values(Deck.Team)) {
          assert.strictEqual(teamMap.get(team)?.length, 3, `team: ${team}`);
        }
        assert.strictEqual(cards[index], deckCard);
        deckCards[index] = null;
      });
    });

    it('should put main team on the center if sp team has main team', () => {
      const card = userCards.find((userCard) => userCard.id === '18')!;
      const simulator = new TestSimulator();
      overrideCard(card, { appeal: 99999, technique: 99999 }, () => {
        const cards = simulator.simulate();
        const center = 4;
        assert.strictEqual(cards[center].team, Deck.Team.Red);
      });
    });

    it('should work with reductions', () => {
      const teams: DeckSimulator.TeamOptions[] = [
        { team: Deck.Team.Red, type: TeamType.Appeal, defender: true, reductions: [] },
        {
          team: Deck.Team.Green,
          type: TeamType.Appeal,
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
      ];
      const cards = new TestSimulator().setOptions({ teams }).simulate();
      assert.deepStrictEqual(
        cards.filter((card) => card.team === Deck.Team.Green).map((card) => card.cardId),
        ['4', '149', '107'],
      );
    });

    it('should work with negative reductions and pick sp cards', () => {
      const teams: DeckSimulator.TeamOptions[] = [
        {
          team: Deck.Team.Red,
          type: TeamType.Voltage,
          defender: true,
          reductions: [
            {
              targets: [Card.Type.Vo],
              param: Parameter.Appeal,
              rate: 10,
            },
            {
              targets: [Card.Type.Sk],
              param: Parameter.Appeal,
              rate: 10,
            },
            {
              targets: [Card.Type.Gd],
              param: Parameter.Appeal,
              rate: 10,
            },
          ],
        },
        { team: Deck.Team.Green, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
        { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
      ];
      const cards = new TestSimulator().setOptions({ teams }).simulate();
      assert.deepStrictEqual(
        cards.filter((card) => card.team === Deck.Team.Red).map((card) => card.cardId),
        ['4', '149', '107'],
      );
    });

    it('should work without sp team', () => {
      const simulator = new TestSimulator();
      const deckCards = simulator.simulate();
      const normalCards = simulator
        .setOptions({
          spTeam: false,
        })
        .simulate();
      assert.notDeepStrictEqual(
        deckCards.map((card) => card.cardId),
        normalCards.map((card) => card.cardId),
      );
    });
  });

  function overrideCard(card, params: Partial<UserCard>, func: () => void) {
    const prev = {};
    try {
      for (const [key, value] of Object.entries(params)) {
        [prev[key], card[key]] = [card[key], value];
      }
      func();
    } finally {
      for (const key of Object.keys(params)) {
        card[key] = prev[key];
      }
    }
  }
});
