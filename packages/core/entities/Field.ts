export interface Field {
  name: string;
  type: Field.Type;
}

export namespace Field {
  export enum Type {
    Number = 'number',
    Parameter = 'Parameter',
    Type = 'Type',
  }
}
