/* auto generated */

import { Field } from './Field';

export class AcCondition {
  id: Id;
  type: AcCondition.Type;
  title: string;
  fields: Field[];
  description: string;
  once: boolean;
}

export namespace AcCondition {
  export enum Type {
    Voltage = 'voltage', // undefined
    Idol = 'idol', // undefined
    Sp = 'sp', // undefined
    Critical = 'critical', // undefined
    Skill = 'skill', // undefined
  }
}
