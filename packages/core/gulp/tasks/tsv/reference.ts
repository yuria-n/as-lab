import * as gulp from 'gulp';

import { parseTsv, registerTsv, writeJSON } from './common';
import { Reference } from '../../../entities';

enum Tsv {
  Reference = 'スクスタシミュレータ - リファレンス一覧.tsv',
}
registerTsv(Tsv);

gulp.task('tsv:reference', async () => {
  const items: Reference[] = parseTsv(Tsv.Reference).map((item) => ({
    name: item.name,
    twitter: item.twitter,
    url: item.url,
  }));

  const name = 'reference';
  writeJSON(name, items);
});
