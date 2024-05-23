import { KizunaRepository } from '../repositories';

export class KizunaService {
  static async getKizunaSkills() {
    return KizunaRepository.getKizunaSkills();
  }
}
