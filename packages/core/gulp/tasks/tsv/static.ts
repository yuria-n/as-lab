import * as gulp from 'gulp';

import { parseArray, parseTsv, registerTsv, writeJSON } from './common';

enum Tsv {
  Text = 'スクスタシミュレータ - 類似テキスト一覧.tsv',
}
registerTsv(Tsv);

gulp.task('tsv:similarText', async () => {
  const items = parseTsv(Tsv.Text).map((item) => ({ chars: parseArray(item.chars), skip: /TRUE/.test(item.skip) }));
  const placeholders = [{ chars: [' ', '　'], skip: true }];
  const name = 'similarText';
  writeJSON(name, [...placeholders, ...items]);
});
