/* auto generated */

import { StoredData } from './StoredData';
import { CardSkill, UserSkill } from './BaseSkill';

export interface Idol {
  id: IdolId;
  name: Name;
  school: School;
  grade: Grade;
}

export enum School {
  Muse = 'muse',
  Aqua = 'aqua',
  Niji = 'niji',
}

export enum Grade {
  First = 1,
  Second,
  Third,
}

export interface KizunaSkill extends CardSkill {
  id: Id;
  title: Title;
  color: string;
}

export interface UserKizunaSkill {
  id: Id;
  skillFields: UserSkill['skillFields'];
}

export interface UserIdol {
  id: Idol['id'];
  kizunaSkills: UserKizunaSkill[];
}

export interface StoredUserIdols extends StoredData {
  version: Version;
  idols: UserIdol[];
}

export enum IdolId {
  Hanayo = 'hanayo',
  Maki = 'maki',
  Umi = 'umi',
  Eri = 'eri',
  Honoka = 'honoka',
  Kotori = 'kotori',
  Rin = 'rin',
  Nozomi = 'nozomi',
  Niko = 'niko',
  Mari = 'mari',
  Yoshiko = 'yoshiko',
  Dia = 'dia',
  Riko = 'riko',
  Chika = 'chika',
  Kanan = 'kanan',
  You = 'you',
  Hanamaru = 'hanamaru',
  Ruby = 'ruby',
  Kanata = 'kanata',
  Mia = 'mia',
  Karin = 'karin',
  Rina = 'rina',
  Kasumi = 'kasumi',
  Setsuna = 'setsuna',
  Ayumu = 'ayumu',
  Emma = 'emma',
  Shizuku = 'shizuku',
  Shioriko = 'shioriko',
  Ai = 'ai',
  Lanzhu = 'lanzhu',
}
