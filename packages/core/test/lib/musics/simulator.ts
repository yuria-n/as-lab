import * as assert from 'assert';

import { Music } from '../../../entities';
import { MusicSimulator, getAccessoryMap, getLiveStage, getSkillMap } from '../../../lib';
import { masters } from '../../../data';
import { userCards } from '../data/userCards';
import { userDeck, userIdols } from './data';

describe('MusicSimulator', () => {
  const skillMap = getSkillMap();
  const accessoryMap = getAccessoryMap();

  let simulator: MusicSimulator;
  let liveStage: Music.LiveStage;
  before(async () => {
    liveStage = await getLiveStage('no_exit_orion_cool_hard');
  });
  beforeEach(() => {
    simulator = new MusicSimulator(
      masters.idols,
      masters.cards,
      skillMap,
      masters.conditions,
      masters.inspirationSkills,
      masters.kizunaSkills,
      accessoryMap,
      liveStage,
      masters.acConditions,
      userDeck,
      userIdols,
      userCards,
      [],
      {
        spSkillInvocationNotes: [],
      },
    );
  });
  describe('simulate', () => {
    it('should work', () => {
      const histories = simulator.simulate();
      assert.strictEqual(histories.length, liveStage.notes.length + 3);
    });

    it('should invoke twice when double tap', () => {
      simulator.simulate();
      assert.strictEqual(
        simulator.getPlayerStatus().currentNotes,
        liveStage.notes.length - liveStage.appealChances.length * 2,
      );
    });
  });
});
