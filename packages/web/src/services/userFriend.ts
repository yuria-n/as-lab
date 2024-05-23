import { entities } from '@as-lab/core';

import { UserFriendRepository } from '../repositories';

export class UserFriendService {
  static async getUserFriends() {
    return UserFriendRepository.getUserFriends();
  }

  static async createUserFriend(userFriend: Omit<entities.UserFriend, 'id'>) {
    return UserFriendRepository.createUserFriend(userFriend);
  }

  static async updateUserFriend(userFriend: entities.UserFriend) {
    return UserFriendRepository.updateUserFriend(userFriend);
  }

  static async deleteUserFriend(userFriendId: entities.UserFriend['id']) {
    return UserFriendRepository.deleteUserFriend(userFriendId);
  }

  static async export() {
    return UserFriendRepository.export();
  }

  static async import(data: entities.StoredUserFriends) {
    return UserFriendRepository.import(data);
  }
}
