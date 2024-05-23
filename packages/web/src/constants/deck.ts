import { entities } from '@as-lab/core';

import teamRed from '../assets/icons/team_red.svg';
import teamGreen from '../assets/icons/team_green.svg';
import teamBlue from '../assets/icons/team_blue.svg';

const Team = entities.Deck.Team;

export const teamNum = 3;
export const changeTeamNotes = 5;
export const cardNum = 9;

export const teamMap: Record<entities.Deck.Team, string> = {
  [Team.Red]: '赤 (作戦1)',
  [Team.Green]: '緑 (作戦2)',
  [Team.Blue]: '青 (作戦3)',
};

export const teamImageMap: Record<entities.Deck.Team, string> = {
  [Team.Red]: teamRed,
  [Team.Green]: teamGreen,
  [Team.Blue]: teamBlue,
};
