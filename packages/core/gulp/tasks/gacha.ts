import * as gulp from 'gulp';

import { Card } from '../../entities';
import { GachaSimulator } from '../../lib';
import { gachaDetails, gachas } from '../../data/masters';

gulp.task('gacha', async () => {
  const simulator = new GachaSimulator(gachas[0], gachaDetails);
  const rarities = Object.values(Card.Rarity).reverse();
  for (let i = 0; i < 10000; i++) {
    simulator.draw(0);
    const { info } = simulator.getStats();
    console.log(
      `[${info.count}] spent: ${info.spent} melon: ${info.melon} ${rarities.map(
        (rarity) => `${rarity}: ${info[rarity]} (${GachaSimulator.fixNumber((info[rarity] / info.count) * 100)}%)`,
      )})`,
    );
  }
});
