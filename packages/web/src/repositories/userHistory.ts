import { entities } from '@as-lab/core';

import { LocalStorage, StorageKey } from '../clients';

interface UserHistory {
  selectedCards: { id: entities.Card['id'] }[];
}
interface Version1 {
  version: 1;
  history: UserHistory;
}

type StoredData = Version1;

export class UserHistoryRepository {
  private static version = 1;
  static async getUserHistory(): Promise<UserHistory> {
    return (await this.get())?.history ?? { selectedCards: [] };
  }

  static async setSelectedCardId(id: entities.Card['id']): Promise<UserHistory> {
    const history = await this.getUserHistory();
    if (history.selectedCards[0]?.id === id) {
      return history;
    }
    history.selectedCards = history.selectedCards.filter((card) => card.id !== id);
    history.selectedCards.unshift({ id });
    await this.set(history);
    return history;
  }

  private static async get(): Promise<StoredData | null> {
    return LocalStorage.get<StoredData>(StorageKey.UserHistory);
  }
  private static async set(history: UserHistory): Promise<void> {
    LocalStorage.set(StorageKey.UserHistory, {
      version: this.version,
      history,
    });
  }
}
