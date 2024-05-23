import { entities, libs, masters } from '@as-lab/core';

export class MusicRepository {
  static async getMusics() {
    return masters.musicList.musics;
  }

  static async getLiveStage(id: entities.Music.LiveStage['id']) {
    return libs.getLiveStage(id);
  }
}
