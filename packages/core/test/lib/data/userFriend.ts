import { UserFriend } from '../../../entities';

export const userFriends: UserFriend[] = [
  {
    id: 'test1',
    name: 'test1',
    card: {
      id: '319',
      personalSkills: [
        {
          skillFields: [7, 3.5],
          conditionFields: [],
        },
        {
          skillFields: [2.5],
          conditionFields: [100],
        },
      ],
      inspirationSkillIds: [
        'appealPlus_passive_sameTeam_NR_medium',
        'appealPlus_passive_sameTeam_NR_medium',
        'appealPlus_passive_sameTeam_NR_medium',
        'appealPlus_passive_sameTeam_NR_medium',
      ],
    },
  },
];
