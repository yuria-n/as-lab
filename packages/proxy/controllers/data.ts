import { singleton } from 'tsyringe';

import * as data from '../data.json';
import { Post, Route } from './decrators';
import { Logger } from '../logger';

type PostDataRequest = typeof data;

@singleton()
@Route('/data')
export class DataController {
  constructor(private readonly logger: Logger) {}

  @Post('/')
  async postData(data: PostDataRequest) {
    this.logger.debug('post data', { data });
  }
}
