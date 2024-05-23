import { UserCard } from './Card';
import { UserAccessory } from './Accessory';
import { StoredData } from './StoredData';

export namespace Deck {
  export interface Card {
    team: Team;
    cardId: UserCard['id'];
  }

  export interface Accessory {
    team: Team;
    id: UserAccessory['id'];
  }

  export enum Team {
    Red = 'red',
    Green = 'green',
    Blue = 'blue',
  }
}

export interface UserDeck {
  id: Id;
  title: Title;
  cards: Deck.Card[];
  accessories: Deck.Accessory[];
  updatedAt?: Timestamp;
}

export interface StoredUserDecks extends StoredData {
  version: Version;
  decks: UserDeck[];
}
