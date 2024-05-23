import 'reflect-metadata';

import { PrivateServer, PublicServer } from './server';

import { Router } from './controllers';
import { container } from 'tsyringe';

const servers = [container.resolve(PublicServer), container.resolve(PrivateServer)];
const router = container.resolve(Router);
router.exposeRestApi();
for (const server of servers) {
  server.listen();
}
