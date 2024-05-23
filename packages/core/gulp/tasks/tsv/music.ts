import * as gulp from 'gulp';

import { AcCondition } from '../../../entities';
import { parseFields, parseTsv, pascalCase, registerTsv, writeEntity, writeJSON, writeTypeScript } from './common';

enum Tsv {
  AcCondition = '楽曲シミュレータ - AC条件.tsv',
}

registerTsv(Tsv);

gulp.task('tsv:music:acConditions', async () => {
  const tsv = parseTsv(Tsv.AcCondition);
  const entity = `
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
        ${tsv.map((data) => `${pascalCase(data.type)} = '${data.type}', // ${data.name}`).join('\n')}
      }
    }
  `;
  writeEntity('AcCondition', entity);

  const items: AcCondition[] = tsv.map((item) => {
    const condition = {
      id: item.id,
      type: item.type as AcCondition.Type,
      title: item.title,
      fields: parseFields(item.fields),
      description: item.description,
      once: /true/i.test(item.once),
    };
    return condition;
  });
  const name = 'musics/acCondition';
  writeJSON(name, items);
  const script = `
    import { AcCondition } from '../../../entities';
    import * as json from '../../json/${name}.json';

    export const acConditions: AcCondition[] = json as AcCondition[]; 
  `;
  writeTypeScript(name, script);
});
