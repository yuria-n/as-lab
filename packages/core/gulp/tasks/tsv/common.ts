import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as prettier from 'prettier';

import * as config from '../../../../../package.json';
import { Card, CardSkill, Condition, Field, Parameter, SkillMap } from '../../../entities';

export function registerTsv(...tsvList: Record<string, any>[]) {
  const tsvPaths = tsvList.flatMap((tsv) => Object.values(tsv));
  const base = path.join(__dirname.split('/').slice(0, 3).join('/'), 'Downloads');
  for (const tsv of tsvPaths) {
    const filepath = path.join(base, tsv);
    if (!fs.existsSync(filepath)) {
      continue;
    }
    const target = path.join(__dirname, '../../../data/tsv', tsv);
    fs.copyFileSync(filepath, target);
    fs.unlinkSync(filepath);
  }
}

export function reverseMap(map: any) {
  const reverseMap = {};
  for (const [key, value] of Object.entries<string>(map)) {
    reverseMap[value] = key;
  }
  return reverseMap;
}

export function writeJSON(name: string, obj: Record<string, any>) {
  fs.writeFileSync(path.resolve(__dirname, '../../../data/json', `${name}.json`), JSON.stringify(obj, null, 2));
}

export function writeTypeScript(name: string, file: string) {
  const code = prettier.format(file, { ...config.prettier, parser: 'typescript' } as any);
  fs.writeFileSync(path.resolve(__dirname, '../../../data/masters', `${name}.ts`), code);
}

export function writeEntity(name: string, file: string) {
  const prefix = '/* auto generated */\n';
  const code = prettier.format(prefix + file, { ...config.prettier, parser: 'typescript' } as any);
  fs.writeFileSync(path.resolve(__dirname, '../../../entities', `${pascalCase(name)}.ts`), code);
}

export function parseFields(field: string): Field[] {
  const typeMap = reverseMap(Field.Type);
  return parseArray(field)
    .map((row) => row.split(':').map((val) => val.trim()))
    .map(([name, type]) => {
      validate(typeMap, type);
      return { name, type: type as Field.Type };
    });
}

export function pascalCase(str: string) {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}

export function parseNumber(str = '') {
  if (isNaN(+str)) {
    throwError(`Invalid number`, str);
  }
  return +str;
}

export function parseArray(str = ''): any[] {
  return str
    .split(',')
    .map((row) => row.trim())
    .filter((row) => row)
    .map((row) => (isNaN(Number(row)) ? row : parseNumber(row)));
}

export function validate(map: any, key: any) {
  if (map instanceof Map ? !map.has(key) : !map[key]) {
    throwError(`Invalid ${key}`, key);
  }
  return key;
}

export function validateObject(map: any, item: any, key: string) {
  if (Array.isArray(item[key])) {
    return item[key].every((str) => validate(map, str));
  }
  if (!map[item[key]]) {
    throwError(`Invalid ${key}`, item);
  }
  return true;
}

const parameterMap = reverseMap(Parameter);
const typeMap = reverseMap(Card.Type);

export function validateSkill<T extends CardSkill>(
  skillMap: SkillMap<any>,
  conditionMap: Map<string, Condition>,
  cardSkill: T,
): T {
  const skill = skillMap.get(cardSkill.skillId);
  if (!skill) {
    throw new Error(`${cardSkill.skillId} not found`);
  }
  validateFields(cardSkill.skillId, skill.fields, cardSkill.skillFields);
  const condition = conditionMap.get(skill.condition);
  if (!condition) {
    console.error({ skill, userSkill: cardSkill });
    throw new Error(`Condition not found. id: ${cardSkill.skillId}`);
  }
  validateFields(cardSkill.skillId, condition.fields, cardSkill.conditionFields);
  if (condition.validator) {
    assert.ok(condition.validator(cardSkill), `Condition validation failed. id: ${cardSkill.skillId}`);
  }
  return cardSkill;
}

export function validateFields(skillId: string, fields: Field[], values: any[]) {
  if (values.length === 0) {
    return;
  }
  if (fields.length !== values.length) {
    throw new Error(`Invalid fields length. id: ${skillId}`);
  }
  for (const [index, field] of fields.entries()) {
    const value = values[index];
    switch (field.type) {
      case Field.Type.Number: {
        if (isNaN(value)) {
          throw new Error(`Invalid skill field value. id: ${skillId} type: ${field.type}`);
        }
        break;
      }
      case Field.Type.Parameter: {
        if (!parameterMap[value]) {
          throw new Error(`Invalid skill field value. id: ${skillId} type: ${field.type}`);
        }
        break;
      }
      case Field.Type.Type: {
        if (!typeMap[value]) {
          throw new Error(`Invalid skill field value. id: ${skillId} type: ${field.type}`);
        }
        break;
      }
    }
  }
}

export function throwError(message: string, item: any) {
  throw new Error(`${message} ${JSON.stringify(item)}`);
}

export function parseTsv(tsvName: string): any[] {
  const filepath = path.resolve(__dirname, '../../../data/tsv', tsvName);
  const file = fs.readFileSync(filepath, 'utf8').trim();
  const [titles, ...rows] = file.split(/\n/g).map((row) => row.split(/\t/g).map((str) => str.trim()));
  return rows.map((items) => {
    const obj: any = {};
    for (const [index, title] of titles.entries()) {
      obj[title] = items[index];
    }
    return obj;
  });
}
