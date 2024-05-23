import { singleton } from 'tsyringe';

import { Post, Route } from './decrators';
import { ProxyManager } from '../server';

@singleton()
@Route('/auth')
export class AuthController {
  constructor(private readonly proxyManager: ProxyManager) {}

  @Post('/')
  async authenticate() {
    // TODO: implement google auth
    const { port, ttl } = this.proxyManager.spawn();
    return { port, ttl };
  }
}
