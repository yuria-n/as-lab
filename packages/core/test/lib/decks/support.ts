import * as assert from 'assert';

import { Card, School, UserCard, UserIdol } from '../../../entities';
import { CardId, userCards } from '../data/userCards';
import { DeckSupportSimulator, getSkillMap } from '../../../lib';
import { allCards, conditions } from '../../../data/masters';
import { masters } from '../../../data';
import { simulator } from '../../../constants';
import { userFriends } from '../data/userFriend';
import { userIdols } from '../musics/data';

describe('DeckSupportSimulator', () => {
  const { idols, cards, inspirationSkills, kizunaSkills } = masters;
  const skillMap = getSkillMap();
  const skillInvocationRate = 0.33;

  function instantiate(userIdols: UserIdol[], userCards: UserCard[], options: DeckSupportSimulator.Options = {}) {
    return new DeckSupportSimulator(
      idols,
      cards,
      skillMap,
      conditions,
      inspirationSkills,
      kizunaSkills,
      userIdols,
      userCards,
      options,
    );
  }

  describe('simulate', () => {
    it('should return all support cards with effects', () => {
      const simulator = instantiate(
        [],
        userCards.filter((card) => card.id === CardId.UmiBlueAmor),
        { attribute: Card.Attribute.Active },
      );
      const result = simulator.simulate();
      const prev = userCards.find((card) => card.id === CardId.UmiBlueAmor);
      const [next] = result.otherCards;
      assert.ok(prev);
      assert.ok(next);
      assert.ok(next.appeal > Math.floor(prev.appeal * 1.2));
    });

    it('should calculate with kanan', () => {
      const targetCards = userCards.filter((card) => card.id === CardId.UmiBlueAmor || card.id === CardId.KananMIko);
      const prev = instantiate([], targetCards, { attribute: Card.Attribute.Active })
        .simulate()
        .otherCards.find((card) => card.id === CardId.UmiBlueAmor);
      const next = instantiate([], targetCards, {
        selectedCardIds: [CardId.KananMIko],
        attribute: Card.Attribute.Active,
      })
        .simulate()
        .otherCards.find((card) => card.id === CardId.UmiBlueAmor);
      assert.ok(prev);
      assert.ok(next);
      assert.ok(next.appeal > prev.appeal);
    });

    it('should work with kotori', () => {
      const userCards = allCards.cards.filter((card) => card.id === CardId.KotoriLovelyPolice);
      const [kotori] = instantiate([], userCards).simulate().otherCards;
      assert.strictEqual(Math.floor(kotori.voltage), 11071);
    });

    it('should work with honoka', () => {
      const userCards = allCards.cards.filter((card) => card.id === CardId.HonokaCosmic);
      const [honoka] = instantiate([], userCards).simulate().otherCards;
      assert.strictEqual(Math.floor(honoka.voltage), 17606);
    });

    it('should apply sp skill up with karin', () => {
      const userCards = allCards.cards.filter((card) => card.id === CardId.KarinBlue);
      const [karin] = instantiate([], userCards).simulate().otherCards;
      assert.strictEqual(Math.floor(karin.spVoltageGain), 397);
    });

    it('should calculate shield', () => {
      const [riko] = instantiate(
        [],
        userCards.filter((card) => card.id === CardId.RikoPrelude),
        { attribute: Card.Attribute.Active },
      ).simulate().otherCards;
      assert.ok(riko);
      const effectRate = 0.26;
      assert.strictEqual(
        Math.floor(riko.shieldGain),
        Math.floor((riko.stamina * effectRate * (skillInvocationRate + riko.skillInvocationRate)) / simulator.teamNum),
      );
    });

    it('should calculate damage reduction', () => {
      const [riko] = instantiate(
        [],
        userCards.filter((card) => card.id === CardId.RikoRoyalAngel),
        { attribute: Card.Attribute.Active },
      ).simulate().otherCards;
      assert.ok(riko);
      const passive = 0.05;
      const effectNotes = 10;
      const effectRate = 0.12;
      const damageReduction = Math.floor(
        DeckSupportSimulator.defaultOptions.damage *
          (passive + (effectNotes * effectRate * skillInvocationRate) / simulator.teamNum),
      );
      assert.strictEqual(Math.floor(riko.damageReduction), damageReduction);
    });

    it('should get sp gauge gain', () => {
      const [umi] = instantiate(
        [],
        userCards.filter((card) => card.id === CardId.UmiSummerFes),
      ).simulate().otherCards;
      assert.ok(umi);
      assert.strictEqual(Math.floor(umi.spGaugeGain), 221);
    });

    it('should calculate with all cards', () => {
      const result = instantiate([], allCards.cards, { attribute: Card.Attribute.Active }).simulate();
      assert.ok(result);
    });

    it('should get same team score when cards are selected and un-selected', () => {
      const userCards = allCards.cards.filter(
        (card) => card.id === CardId.KananSecretGalaxy || card.id === CardId.ChikaKyun,
      );
      const [prev] = instantiate([], userCards, {
        selectedCardIds: userCards.map((card) => card.id),
      }).simulate().selectedCards;
      const [next] = instantiate([], userCards, {
        selectedCardIds: userCards.map((card) => card.id).filter((id) => id === CardId.KananSecretGalaxy),
      }).simulate().otherCards;
      assert.ok(prev);
      assert.ok(next);
      assert.strictEqual(prev.teamScore, next.teamScore);
    });

    it('should get sp skill effect', () => {
      const userCards = allCards.cards.filter(
        (card) => card.id === CardId.KananSecretGalaxy || card.id === CardId.KotoriLovelyPolice,
      );
      const [kanan] = instantiate([], userCards, {
        selectedCardIds: userCards.map((card) => card.id).filter((id) => id === CardId.KananSecretGalaxy),
      }).simulate().otherCards;
      assert.strictEqual(Math.floor(kanan.supportScore), 616);
    });

    it('should apply negative team affect', () => {
      const userCards = allCards.cards.filter((card) => card.id === CardId.KananBlueReve);
      const [kanan] = instantiate([], userCards).simulate().otherCards;
      assert.strictEqual(kanan.skillInvocationRate, -0.05);
    });

    it('should calculate score properly', () => {
      const userCards = allCards.cards.filter((card) => card.id === CardId.YouToy);
      const [you] = instantiate([], userCards).simulate().otherCards;
      assert.strictEqual(Math.floor(you.teamScore), 23154);
    });

    it('should apply kizuna skills', () => {
      const userCards = allCards.cards.filter((card) => card.id === CardId.HonokaCosmic);
      const [prev] = instantiate([], userCards).simulate().otherCards;
      const [next] = instantiate(userIdols, userCards).simulate().otherCards;
      assert.ok(next.voltageWithCritical > prev.voltageWithCritical);
      assert.ok(next.criticalRate > prev.criticalRate);
    });

    it('should apply reduction kizuna skill effect', () => {
      const userCards = allCards.cards.filter((card) => card.id === CardId.KananBlueReve);
      const [kanan] = instantiate(userIdols, userCards).simulate().otherCards;
      assert.strictEqual(Math.trunc(kanan.skillInvocationRate * 10000) / 10000, -0.045);
    });

    it('should apply reduction kizuna skill effect with selected card', () => {
      const userCards = allCards.cards.filter(
        (card) => card.id === CardId.KananBlueReve || card.id === CardId.YouMiracleVoyage,
      );
      const [you] = instantiate(userIdols, userCards, {
        selectedCardIds: [CardId.KananBlueReve],
      }).simulate().otherCards;
      assert.strictEqual(Math.trunc(you.skillInvocationRate * 10000) / 10000, -0.095);
    });

    it('should apply voltage limit', () => {
      const userCards = allCards.cards.filter((card) => card.id === CardId.KananBlueReve);
      const [kanan] = instantiate(userIdols, userCards, {
        voltageLimit: 0.1,
        schoolBonus: 100,
        school: School.Aqua,
      }).simulate().otherCards;
      assert.strictEqual(Math.floor(kanan.voltage), 55000);
      assert.strictEqual(Math.floor(kanan.criticalValue), 55000);
    });

    it('should apply damage times', () => {
      const userCards = allCards.cards.filter((card) => card.id === CardId.DiaCherryBlossom);
      const [prev] = instantiate(userIdols, userCards).simulate().otherCards;
      const [next] = instantiate(userIdols, userCards, { damage: 350 }).simulate().otherCards;
      assert.ok(next.shieldGain > prev.shieldGain);
    });

    describe('friends', () => {
      const [friend] = userFriends;
      it('should apply friend skills', () => {
        const cards = userCards.filter((card) => card.id === CardId.UmiBlueAmor);
        const [prev] = instantiate([], cards).simulate().otherCards;
        const [next] = instantiate([], cards, { centerCardId: CardId.UmiBlueAmor, friend }).simulate().otherCards;
        assert.ok(next.appeal > prev.appeal);
      });
    });
  });
});
