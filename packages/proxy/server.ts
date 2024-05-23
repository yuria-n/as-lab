import * as bodyParser from 'body-parser';
import * as express from 'express';
import { singleton } from 'tsyringe';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

import { Logger } from './logger';
import { config } from './config';

class Server {
  readonly app = express();
  protected readonly port: number;
  protected constructor(protected readonly logger: Logger) {
    this.app.use(bodyParser.json({ limit: '2mb' }));
  }

  listen() {
    this.app.get('/', (_, res) => res.send());
    this.app.listen(this.port, () => {
      this.logger.info(`listening on ${this.port}`);
    });
  }
}

@singleton()
export class PublicServer extends Server {
  protected readonly port = config.port.external;
  constructor(protected readonly logger: Logger) {
    super(logger);
  }
}

@singleton()
export class PrivateServer extends Server {
  protected readonly port = config.port.internal;
  constructor(protected readonly logger: Logger) {
    super(logger);
  }
}

@singleton()
export class ProxyManager {
  private readonly ttl = config.proxy.ttl;
  private readonly delay = config.proxy.delay;
  private readonly ports: Port[];
  private readonly serverMap = new Map<Port, { server: ProxyServer; ttl: number }>();
  private interval: NodeJS.Timeout | null;
  constructor(private readonly logger: Logger) {
    const { min, max } = config.proxy.port;
    this.ports = Array.from({ length: max - min + 1 }, (_, index) => index + min).sort(
      () => Math.random() - Math.random(),
    );
  }

  close() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private startTimer() {
    if (this.interval) {
      return;
    }
    this.interval = setInterval(() => {
      for (const [port, { server, ttl }] of this.serverMap) {
        if (ttl > Date.now()) {
          break;
        }
        server.close();
        this.serverMap.delete(port);
        this.ports.push(port);
      }
      if (this.serverMap.size === 0 && this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    }, this.delay);
  }

  spawn() {
    const port = this.ports.shift();
    if (!port) {
      throw new Error('Port not found');
    }
    const ttl = Date.now() + this.ttl;
    this.logger.info('Spawning proxy server', { port, ttl });
    const server = new ProxyServer(port, this.logger);
    this.serverMap.set(port, { server, ttl });
    this.startTimer();
    return {
      port,
      ttl,
    };
  }
}

export class ProxyServer {
  private readonly server: ChildProcessWithoutNullStreams;
  private readonly scriptPath = config.proxy.script;
  constructor(private readonly port: Port, private readonly logger: Logger) {
    this.server = spawn('mitmdump', ['-s', this.scriptPath, '--listen-port', this.port.toString()]);
    this.server.stderr.on('data', (data) => this.logger.error('proxy server error', data.toString()));
    this.server.on('close', (code) => this.logger.info('proxy server is closed', { port, code }));
  }

  close() {
    this.server.kill();
  }
}
