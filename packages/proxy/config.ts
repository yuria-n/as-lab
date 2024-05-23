import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, './.env') });

export const config = {
  debug: /true/i.test(process.env.DEBUG!),
  proxy: {
    ttl: 10 * 60 * 1000, // 10 min
    delay: 30 * 1000, // 30sec
    script: path.resolve(__dirname, 'user_data.py'),
    port: {
      min: 1000,
      max: 9999,
    },
  },
  port: {
    external: 127,
    internal: 65535,
  },
};
