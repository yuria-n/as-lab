import * as no_exit_orion_cool_hard from '../../data/json/musics/stages/no_exit_orion_cool_hard.json';
import * as like_it_love_it_cool_hard from '../../data/json/musics/stages/like_it_love_it_cool_hard.json';
import { Music } from '../../entities';

const liveStageMap = { no_exit_orion_cool_hard, like_it_love_it_cool_hard } as Record<Id, Music.LiveStage>;

/**
 * TODO: Dynamic import
 * 1. put all static data (master data) into public directory
 * 2. set the pass to the env
 * 3. get the pass from the arguments
 */
export async function getLiveStage(id: Music.LiveStage['id']): Promise<Music.LiveStage> {
  const liveStage = liveStageMap[id];
  if (!liveStage) {
    throw new Error('Invalid live stage id');
  }
  return liveStage;
}
