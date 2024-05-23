import * as assert from 'assert';

import { CardSkill, Deck, Music, SkillEffect, UserFriend } from '../../../entities';
import { MusicSimulator, SchoolIdol, getAccessoryMap, getLiveStage, getSkillMap } from '../../../lib';
import { SkillHandler } from '../../../lib';
import { masters } from '../../../data';
import { times, toMap } from '../../../utils';
import { userCards } from '../data/userCards';
import { userDeck, userIdols } from './data';

describe('SkillHandler', () => {
  const skillMap = getSkillMap();
  const accessoryMap = getAccessoryMap();

  let handler: SkillHandler;
  let liveStage: Music.LiveStage;
  before(async () => {
    // TODO: change it to yumenotobira
    liveStage = await getLiveStage('no_exit_orion_cool_hard');
  });
  beforeEach(() => {
    initHandler();
  });

  interface Options {
    userIdols?: typeof userIdols;
    friend?: UserFriend;
  }

  function initHandler(options: Options = {}) {
    handler = new SkillHandler(
      masters.idols,
      masters.cards,
      skillMap,
      masters.conditions,
      masters.inspirationSkills,
      masters.kizunaSkills,
      accessoryMap,
      liveStage,
      userDeck,
      options.userIdols ?? [],
      userCards,
      [],
      options.friend ?? null,
      MusicSimulator.defaultOptions.tapRateMap,
    ).init();
    return handler;
  }
  const userCardMap = toMap(userCards, 'id');
  const cardId = '112';

  const teamBonus = 1 - 0.05 + 0.05 * 2;
  // ruby(18), honoka(251), chika(28), umi(112), chika(263), kanan(12), ruby(157), eri(122), ruby(139)
  const appealPlusBonus = 0.06 + 0.029 + 0.036 + 0.065 + 0.06 + 0.036 + 0.036 + 0.036 + 0.046;
  // ruby(18), chika(28), umi(112), chika(263)
  const inspirationAppealPlusBonus = 0.02 + 0.01 + 0.02 * 2 + 0.01;
  const passiveBonus = 1 + appealPlusBonus + inspirationAppealPlusBonus;

  describe('init', () => {
    it('should apply bonuses', () => {
      const baseCard = userDeck.cards.find((deckCard) => deckCard.cardId === cardId)!;
      const userCard = userCardMap.get(baseCard.cardId)!;
      const schoolIdol = handler.getSchoolIdols(Deck.Team.Red).find((schoolIdol) => schoolIdol.card.id === cardId)!;
      assert.ok(schoolIdol);
      assert.strictEqual(schoolIdol.status.appeal, Math.floor(userCard.appeal * passiveBonus));
      assert.strictEqual(schoolIdol.status.voltage, Math.floor(Math.floor(userCard.appeal * passiveBonus)));
    });

    it('should apply friend bonuses', () => {
      const appealPlus1 = 7;
      const appealPlus2 = 2.5;
      const appealPlus3 = 2;
      const friend: UserFriend = {
        id: 'test',
        name: 'test',
        card: {
          // Secret Galaxy, kanan
          id: '319',
          personalSkills: [
            {
              skillFields: [appealPlus1, 3.5],
              conditionFields: [],
            },
            {
              skillFields: [appealPlus2],
              conditionFields: [100],
            },
          ],
          inspirationSkillIds: ['appealPlus_passive_sameGrade_NR_medium'],
        },
      };
      initHandler({ friend });
      const baseCard = userDeck.cards.find((deckCard) => deckCard.cardId === cardId)!;
      const userCard = userCardMap.get(baseCard.cardId)!;
      const schoolIdol = handler.getSchoolIdols(Deck.Team.Red).find((schoolIdol) => schoolIdol.card.id === cardId)!;
      const passiveBonusExtra = passiveBonus + (appealPlus1 + appealPlus3) / 100;
      assert.ok(schoolIdol);
      assert.strictEqual(schoolIdol.status.appeal, Math.floor(userCard.appeal * passiveBonusExtra));
    });
  });

  describe('invokeTeamEffects', () => {
    const method = 'invokeTeamEffects';
    it('should apply team bonuses', () => {
      handler[method]();
      const baseCard = userDeck.cards.find((deckCard) => deckCard.cardId === cardId)!;
      const userCard = userCardMap.get(baseCard.cardId)!;
      const schoolIdol = handler.getSchoolIdols(Deck.Team.Red).find((schoolIdol) => schoolIdol.card.id === cardId)!;
      assert.ok(schoolIdol);
      const appeal = Math.floor(userCard.appeal * passiveBonus * teamBonus);
      assert.strictEqual(schoolIdol.status.voltage, appeal - 1);
    });

    it('should apply kizuna bonuses', () => {
      initHandler({ userIdols })[method]();
      const baseCard = userDeck.cards.find((deckCard) => deckCard.cardId === cardId)!;
      const userCard = userCardMap.get(baseCard.cardId)!;
      const schoolIdol = handler.getSchoolIdols(Deck.Team.Red).find((schoolIdol) => schoolIdol.card.id === cardId)!;
      const teamBonusWithReduction = teamBonus + 0.005 * 2;
      assert.ok(schoolIdol);
      const appeal = Math.floor(userCard.appeal * passiveBonus * teamBonusWithReduction);
      assert.strictEqual(schoolIdol.status.voltage, appeal);
    });
  });

  describe('invoke', () => {
    it.skip('should invoke live effect and music start skills', () => {
      handler.invoke(Music.Event.MusicStart);
      const schoolIdol = handler.getSchoolIdols(Deck.Team.Red).find((schoolIdol) => schoolIdol.card.id === '112')!;
      assert.ok(schoolIdol);
      const effectSet = schoolIdol.status['effectsMap'].get(SkillEffect.AppealPlus)!;
      assert.ok(Array.from(effectSet).find((effect) => effect.rate === -0.2));
    });

    it('should work with all events', () => {
      const skipEventSet = new Set([
        Music.Event.Damage,
        Music.Event.TapFailed,
        Music.Event.TapSucceeded,
        Music.Event.TeamEffect,
      ]);
      for (const event of Object.values<any>(Music.Event)) {
        if (skipEventSet.has(event) || typeof event === 'string') {
          continue;
        }
        handler.invoke(event);
      }
    });
  });

  describe('changeTeam', () => {
    let schoolIdolMap: Map<SchoolIdol['card']['id'], SchoolIdol>;
    before(() => {
      schoolIdolMap = new Map(
        initHandler()
          .getSchoolIdols()
          .map((schoolIdol) => [schoolIdol.card.id, schoolIdol]),
      );
    });

    it('should change team and invoke a team skill', () => {
      const team = Deck.Team.Red;
      times(10, () => {
        initHandler();
        const [changeTeamEvent] = handler.clearEvents().changeTeam(team).getEvents();
        assert.ok(changeTeamEvent);
        const { cardId, payload } = changeTeamEvent;
        const schoolIdol = schoolIdolMap.get(cardId!)!;
        assert.ok(schoolIdol, 'school idol should exist');
        assert.strictEqual(schoolIdol.team, team);
        switch (cardId) {
          // [18:夢のスイートポテト/ファンタスティックピエロ] 黒澤 ルビィ
          case '18': {
            assert.strictEqual(payload.effect.type, SkillEffect.ChangeTeamNotesLose);
            assert.strictEqual(payload.effect.value, -2);
            assert.strictEqual(handler.playerStatus.changeTeamNotes, 3);
            break;
          }
          // [112:一射入魂/ブルーアモール] 園田 海未
          case '111':
          // [263:あなたと一緒に海を見ていたいな/チカキュン☆サマー] 高海 千歌
          // falls through
          case '263': {
            assert.strictEqual(payload.effect.type, SkillEffect.VoltageGain);
            assert.strictEqual(payload.effect.value, Math.floor(schoolIdol.status.appeal * 0.05));
            assert.strictEqual(handler.playerStatus.changeTeamNotes, 5);
            break;
          }
        }
      });
    });

    it('should invoke a team skill which a school idol has', () => {
      const schoolIdolMap = new Map(handler.getSchoolIdols().map((schoolIdol) => [schoolIdol.card.id, schoolIdol]));
      times(10, () => {
        initHandler();
        const [, ...schoolIdolEvents] = handler.clearEvents().changeTeam(Deck.Team.Red).getEvents();
        for (const { event, cardId, payload } of schoolIdolEvents) {
          assert.strictEqual(event, Music.Event.ChangeTeam);
          const schoolIdol = schoolIdolMap.get(cardId!)!;
          assert.ok(schoolIdol);
          switch (cardId) {
            // [157:ほっぺた落ちちゃいそう/Sweets Deco] 黒澤 ルビィ
            case '157': {
              assert.strictEqual(payload.effect.type, SkillEffect.SpGaugeGainUp);
              assert.strictEqual(payload.effect.rate, 0.1);
              assert.strictEqual(payload.effect.until, 15 + 1);
              break;
            }
            // [263:あなたと一緒に海を見ていたいな/チカキュン☆サマー] 高海 千歌
            case '263': {
              assert.strictEqual(payload.effect.type, SkillEffect.VoltageGain);
              assert.strictEqual(payload.effect.value, Math.floor(schoolIdol.status.appeal * 0.6));
              break;
            }
          }
        }
      });
    });
  });

  describe('play', () => {
    it('should play the first tap', () => {
      const deckCardIds = handler.getSchoolIdols(Deck.Team.Green).map((deckCard) => deckCard.card.id);
      const [tapEvent, comboEvent] = handler
        .clearEvents()
        .play(Music.AcStatus.None, false)
        .getEvents()
        .filter(({ event }) => event === Music.Event.TapSucceeded);
      assert.ok(tapEvent);
      assert.ok(deckCardIds.includes(tapEvent.cardId!));
      assert.ok(comboEvent);
    });
  });

  describe('invokeUserSkill', () => {
    const notes = 5;
    const rate = 5;
    const cardSkill: CardSkill = {
      skillId: 'appealUp_probability_myself',
      skillFields: [notes, rate],
      conditionFields: [1],
    };

    it('should invoke a user skill', () => {
      const actress = handler.getSchoolIdols(Deck.Team.Red).find((schoolIdol) => schoolIdol.card.id === '112')!;
      const prevAppeal = actress.status.appeal;
      handler['invokeUserSkill'](SkillHandler.Actor.Idol, Music.Event.TapSucceeded, actress, cardSkill, false);
      const nextAppeal = actress.status.appeal;
      assert.strictEqual(nextAppeal, Math.round(prevAppeal * (1 + rate / 100)));
    });

    it('should clear a user skill after specific notes', () => {
      const actress = handler.getSchoolIdols(Deck.Team.Red).find((schoolIdol) => schoolIdol.card.id === '112')!;
      const prevAppeal = actress.status.appeal;
      handler['invokeUserSkill'](SkillHandler.Actor.Idol, Music.Event.TapSucceeded, actress, cardSkill, false);
      handler.prepare(handler.playerStatus.currentNotes + notes);
      assert.strictEqual(actress.status.appeal, Math.round(prevAppeal * (1 + rate / 100)));
      handler.prepare(handler.playerStatus.currentNotes + notes + 1);
      assert.strictEqual(actress.status.appeal, prevAppeal);
    });
  });
});
