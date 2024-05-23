import { entities } from '@as-lab/core';

import { MusicRepository } from '../repositories';

export class MusicService {
  static async getMusics() {
    return MusicRepository.getMusics();
  }

  static async getLiveStage(id: entities.Music.LiveStage['id']) {
    return MusicRepository.getLiveStage(id);
  }
}
