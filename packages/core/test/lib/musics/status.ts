import * as assert from 'assert';

import { BaseEffect, CardStatus } from '../../../lib';
import { SkillEffect, UserAccessory, UserCard } from '../../../entities';

describe('CardStatus', () => {
  const rate = 0.02;
  const card = {
    appeal: 10000,
    stamina: 11000,
    technique: 12000,
  } as UserCard;
  const accessory = {
    appeal: 700,
    stamina: 800,
    technique: 900,
  } as UserAccessory;
  let cardStatus: CardStatus;
  beforeEach(() => {
    cardStatus = new CardStatus(card);
  });
  function getAppealPlus() {
    return {
      type: SkillEffect.AppealPlus,
      rate,
    } as const;
  }
  function getAppealUp(param: Pick<BaseEffect, 'rate' | 'until'> = {}) {
    return {
      type: SkillEffect.AppealUp,
      rate: param.rate ?? rate,
      until: param.until ?? 5,
    } as const;
  }

  function getRate(rates: Rate | Rate[]) {
    rates = Array.isArray(rates) ? rates : [rates];
    return rates.reduce((sum, rate) => sum + rate, 1);
  }

  function getValue(value: Value, rates: Rate | Rate[]) {
    rates = Array.isArray(rates) ? rates : [rates];
    return Math.floor(rates.reduce((result, rate) => result * rate, value));
  }

  /**
   * base = appeal * passive + accessory
   * value = base * the total of rates * the total of rates * ....
   */
  describe('appealPlus', () => {
    it('should apply passive appeal plus', () => {
      assert.strictEqual(cardStatus.appeal, card.appeal);
      assert.strictEqual(cardStatus.stamina, card.stamina);
      assert.strictEqual(cardStatus.technique, card.technique);
      cardStatus.applyPassiveEffect(getAppealPlus());
      assert.strictEqual(cardStatus.appeal, getValue(card.appeal, getRate(rate)));
      assert.strictEqual(cardStatus.stamina, card.stamina);
      assert.strictEqual(cardStatus.technique, card.technique);
    });

    it('should apply multiple passive appeal plus', () => {
      cardStatus
        .applyPassiveEffect(getAppealPlus())
        .applyPassiveEffect(getAppealPlus())
        .applyPassiveEffect(getAppealPlus());
      assert.strictEqual(cardStatus.appeal, getValue(card.appeal, getRate(rate * 3)));
    });

    it('should apply passive appeal plus and live appeal plus', () => {
      cardStatus.applyPassiveEffect(getAppealPlus()).applyEffect(getAppealPlus());
      assert.strictEqual(cardStatus.appeal, getValue(card.appeal, [getRate(rate), getRate(rate)]));
    });

    it('should only apply passive appeal plus to card', () => {
      cardStatus.addParameter(accessory, 1);
      assert.strictEqual(cardStatus.appeal, card.appeal + accessory.appeal);
      assert.strictEqual(cardStatus.stamina, card.stamina + accessory.stamina);
      assert.strictEqual(cardStatus.technique, card.technique + accessory.technique);
      cardStatus.applyPassiveEffect(getAppealPlus());
      assert.strictEqual(cardStatus.appeal, getValue(card.appeal, getRate(rate)) + accessory.appeal);
      assert.strictEqual(cardStatus.stamina, card.stamina + accessory.stamina);
      assert.strictEqual(cardStatus.technique, card.technique + accessory.technique);
    });

    it('should apply live appeal plus to card and accessory', () => {
      cardStatus.addParameter(accessory, 1).applyEffect(getAppealPlus());
      assert.strictEqual(cardStatus.appeal, getValue(card.appeal + accessory.appeal, getRate(rate)));
    });

    it('should apply passive and live appeal plus', () => {
      cardStatus.addParameter(accessory, 1).applyPassiveEffect(getAppealPlus()).applyEffect(getAppealPlus());
      assert.strictEqual(
        cardStatus.appeal,
        getValue(getValue(card.appeal, getRate(rate)) + accessory.appeal, getRate(rate)),
      );
    });
  });

  describe('appealUp', () => {
    it('should effect passive appeal up', () => {
      cardStatus.applyEffect(getAppealUp());
      assert.strictEqual(cardStatus.appeal, getValue(card.appeal, getRate(rate)));
      assert.strictEqual(cardStatus.stamina, card.stamina);
      assert.strictEqual(cardStatus.technique, card.technique);
    });

    it('should effect passive appeal up to card and accessory', () => {
      cardStatus.addParameter(accessory, 1).applyEffect(getAppealUp());
      assert.strictEqual(cardStatus.appeal, getValue(card.appeal + accessory.appeal, getRate(rate)));
    });

    it('should effect multiple passive appeal up to card and accessory', () => {
      cardStatus
        .addParameter(accessory, 1)
        .applyEffect(getAppealUp())
        .applyEffect(getAppealUp())
        .applyEffect(getAppealUp());
      assert.strictEqual(cardStatus.appeal, getValue(card.appeal + accessory.appeal, getRate(rate * 3)));
    });

    it('should effect multiple passive appeal up to card and accessory', () => {
      cardStatus
        .addParameter(accessory, 1)
        .applyEffect(getAppealUp())
        .applyEffect(getAppealUp())
        .applyEffect(getAppealUp());
      assert.strictEqual(cardStatus.appeal, getValue(card.appeal + accessory.appeal, getRate(rate * 3)));
    });

    it('should clear appeal up after until', () => {
      const until = 5;
      cardStatus.addParameter(accessory, 1).applyEffect(getAppealUp({ until }));
      assert.strictEqual(cardStatus.appeal, getValue(card.appeal + accessory.appeal, getRate(rate)));
      cardStatus.prepare(until + 1);
      assert.strictEqual(cardStatus.appeal, card.appeal + accessory.appeal);
    });

    it('should clear appeal up partially', () => {
      cardStatus
        .addParameter(accessory, 1)
        .applyEffect(getAppealUp({ until: 1 }))
        .applyEffect(getAppealUp({ until: 2 }))
        .applyEffect(getAppealUp({ until: 3 }));
      assert.strictEqual(cardStatus.appeal, getValue(card.appeal + accessory.appeal, getRate(rate * 3)));
      cardStatus.prepare(2);
      assert.strictEqual(cardStatus.appeal, getValue(card.appeal + accessory.appeal, getRate(rate * 2)));
      cardStatus.prepare(3);
      assert.strictEqual(cardStatus.appeal, getValue(card.appeal + accessory.appeal, getRate(rate * 1)));
      cardStatus.prepare(4);
      assert.strictEqual(cardStatus.appeal, card.appeal + accessory.appeal);
    });
  });
});
