import * as fs from 'fs';
import * as path from 'path';

import * as gulp from 'gulp';
import * as minimist from 'minimist';
import Aigle from 'aigle';
import axios from 'axios';

const args = minimist(process.argv);

const baseUrl = 'https://image.boom-app.wiki/wiki/5d819d9eb1b4b84e8b58ed07/chara/s';
const targetDir = path.resolve(__dirname, '../../../', 'web/public/assets/cards');

/**
 * gulp download:image --id 1
 */
gulp.task('download:image', async () => {
  const id = Number(args.id);
  if (isNaN(id)) {
    throw new Error('Invalid ID');
  }
  await download(id);
});

/**
 * gulp download:images --from 1 --to 10
 */
gulp.task('download:images', async () => {
  const from = Number(args.from);
  if (isNaN(from)) {
    throw new Error('Invalid from');
  }
  const to = Number(args.to);
  if (isNaN(to)) {
    throw new Error('Invalid to');
  }
  for (let id = from; id <= to; id++) {
    await download(id);
    if (id === to) {
      continue;
    }
    const delay = Math.random() * 1000 + 5000;
    await Aigle.delay(delay);
  }
});

export async function download(id: number, override = false) {
  const filename = `${id.toString().padStart(4, '0')}.jpg`;
  const filepath = path.resolve(targetDir, filename);
  if (!override && fs.existsSync(filepath)) {
    return;
  }
  const url = `${baseUrl}/${filename}`;
  console.log(`downloading images... ${filename}`);
  const { data } = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(filepath, data);
}
