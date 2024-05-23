import { InspirationSkillRepository } from '../repositories';

export class InspirationSkillService {
  static async getInspirationSkills() {
    return InspirationSkillRepository.getInspirationSkills();
  }
}
