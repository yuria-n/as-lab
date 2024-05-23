import * as assert from 'assert';

import { GachaSimulator } from '../../lib';
import { details, gacha } from './gachaData';

describe('GachaSimulator', () => {
  const simulator = new GachaSimulator(gacha, details);
  describe('getExpectedValue', () => {
    const key = 'getExpectedValue';
    it('should get an expected value without melon for 10 cost', () => {
      const value = simulator[key](0, false, false);
      assert.strictEqual(value, 200);
    });

    it('should get an expected value with melon for 10 cost', () => {
      const value = simulator[key](0, true, false);
      assert.strictEqual(value, 164.47);
    });

    it('should get an expected value without melon for 50 cost', () => {
      const value = simulator[key](1, false, false);
      assert.strictEqual(value, 1000);
    });

    it('should get an expected value with melon for 50 cost', () => {
      const value = simulator[key](1, true, false);
      assert.strictEqual(value, 822.37);
    });

    it('should get an expected value without melon for 500 cost', () => {
      const value = simulator[key](2, false, false);
      assert.strictEqual(value, 1000);
    });

    it('should get an expected value with melon for 500 cost', () => {
      const value = simulator[key](2, true, false);
      assert.strictEqual(value, 787.15);
    });
  });

  const hashKey = 1;

  describe('encodeGacha', () => {
    it('should generate hex hash', () => {
      const base = 15;
      const ids = ['1', '12', '2'];
      const hash = GachaSimulator.encodeGacha(hashKey, base, ids);
      assert.strictEqual(hash, 'tDvL61');
    });

    it('should generate base 284 hash', () => {
      const base = 283;
      const ids = ['283', '282', '281', '280', '279', '278', '277', '276', '275', '274'];
      const hash = GachaSimulator.encodeGacha(hashKey, base, ids);
      assert.strictEqual(hash, 'h8O9tvQJh9TgMNAvP3');
    });

    it('should generate hash with base 4', () => {
      const base = 3;
      const ids = ['2', '2', '2', '3', '1', '3', '2', '2', '3', '3'];
      const hash = GachaSimulator.encodeGacha(hashKey, base, ids);
      assert.strictEqual(hash, '0ftQdor2');
    });
  });

  describe('decodeGacha', () => {
    function random(num: number) {
      return Math.floor(Math.random() * num);
    }

    it('should get card ids by hex hash', () => {
      const hash = 'tDvL61';
      const result = GachaSimulator.decodeGacha(hash);
      assert.strictEqual(result.hashKey, hashKey);
      assert.deepStrictEqual(result.cardIds, ['1', '12', '2']);
    });

    it('should get card ids by 284 hash', () => {
      const hash = 'h8O9tvQJh9TgMNAvP3';
      const result = GachaSimulator.decodeGacha(hash);
      assert.strictEqual(result.hashKey, hashKey);
      assert.deepStrictEqual(result.cardIds, ['283', '282', '281', '280', '279', '278', '277', '276', '275', '274']);
    });

    it('should word with base 2', () => {
      const base = 1;
      const ids = ['1', '1'];
      const hash = GachaSimulator.encodeGacha(hashKey, base, ids);
      const result = GachaSimulator.decodeGacha(hash);
      assert.deepStrictEqual(result.cardIds, ids);
    });

    it('should work with base 6', () => {
      const base = 5;
      const ids = ['3', '1'];
      const hash = GachaSimulator.encodeGacha(hashKey, base, ids);
      const result = GachaSimulator.decodeGacha(hash);
      assert.deepStrictEqual(result.cardIds, ids);
    });

    it('should work with base 10', () => {
      const base = 9;
      const ids = ['3', '1'];
      const hash = GachaSimulator.encodeGacha(hashKey, base, ids);
      const result = GachaSimulator.decodeGacha(hash);
      assert.deepStrictEqual(result.cardIds, ids);
    });

    it('should work with base 14', () => {
      const base = 13;
      const ids = ['3', '6', '7', '1', '5', '11'];
      const hash = GachaSimulator.encodeGacha(hashKey, base, ids);
      const result = GachaSimulator.decodeGacha(hash);
      assert.deepStrictEqual(result.cardIds, ids);
    });

    it('should work with any base and any card ids', () => {
      for (let base = 1; base <= 999; base++) {
        const size = random(10) + 1;
        const ids = Array.from({ length: size }, () => (random(base) + 1).toString());
        const hash = GachaSimulator.encodeGacha(hashKey, base, ids);
        assert.ok(/^[a-zA-Z0-9]+$/.test(hash));
        const result = GachaSimulator.decodeGacha(hash);
        assert.deepStrictEqual(result.cardIds, ids, `base: ${base}, hash: ${hash}`);
      }
    });
  });
});
