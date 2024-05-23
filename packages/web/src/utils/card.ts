import { entities } from '@as-lab/core';

import { config } from '../config';

export enum Display {
  Name = 1,
  Evolution = 2,
  Both = 3,
}

export function getCardTitle(card: entities.Card, idol: entities.Idol, display: Display) {
  const name = (display & Display.Name) === Display.Name ? card.name : '';
  const evolution = (display & Display.Evolution) === Display.Evolution ? card.evolutionName : '';
  return `[${config.feature ? `${card.id}:` : ''}${[name, evolution].filter((str) => str).join('/')}] ${idol.name}`;
}

export const dirPath = `${config.assets}/cards`;
export const melonPath = `${dirPath}/melon.jpg`;

export function getCardImageUrl(id: entities.Card['id']) {
  return `${dirPath}/${id.padStart(4, '0')}.jpg`;
}
