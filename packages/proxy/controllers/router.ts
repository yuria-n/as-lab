import * as express from 'express';

import { FieldName, RouteOption, childOptionMap, childRouteMap, parentRouteMap } from './decrators';
import { PrivateServer, PublicServer } from '../server';
import { container, singleton } from 'tsyringe';

import { CustomError } from '../error';
import DependencyContainer from 'tsyringe/dist/typings/types/dependency-container';
import { Logger } from '../logger';

@singleton()
export class Router {
  constructor(
    private readonly logger: Logger,
    private readonly publicServer: PublicServer,
    private readonly privateServer: PrivateServer,
  ) {}

  exposeRestApi() {
    for (const [Class, fieldMap] of childRouteMap) {
      const parentRoute = parentRouteMap.get(Class);
      const optionMap = childOptionMap.get(Class);
      for (const [field, { method, childRoute }] of fieldMap) {
        const route = parentRoute ? `${parentRoute}${childRoute}` : childRoute;
        const option: RouteOption = optionMap?.get(field) ?? {};
        const methodName = method.toLowerCase();
        const handler = this.createExpressHandler(Class, field);
        this.privateServer.app[methodName](route, handler);
        if (!option.private) {
          this.publicServer.app[methodName](route, handler);
        }
      }
    }
    return this;
  }

  private createExpressHandler(Class: Constructor, field: FieldName) {
    return async (req: express.Request, res: express.Response) => {
      try {
        const buffer =
          req.headers['content-type'] !== 'multipart/form-data'
            ? undefined
            : await new Promise((resolve, reject) => {
                const buffers: Buffer[] = [];
                req
                  .on('data', (chunk) => buffers.push(chunk))
                  .on('end', () => resolve(Buffer.concat(buffers)))
                  .on('error', reject);
              });
        const params = Object.assign({}, req.body, req.params, req.query, { buffer });
        const remoteIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress!;
        this.logger.info('receive request', { path: req.path, remoteIp });
        const child = container.createChildContainer();
        res.send(await this.processRequest(child, Class, field, params));
      } catch (err) {
        res.status(err.statusCode).send(err);
      }
    };
  }

  private async processRequest(container: DependencyContainer, Class: Constructor, field: FieldName, params: any) {
    const logger = container.resolve(Logger);
    try {
      params ||= {};
      logger.debug('request params', params);
      const controller = container.resolve(Class);
      return await controller[field](params);
    } catch (err) {
      if (err instanceof CustomError) {
        logger.info('process request error', err);
        throw err;
      }
      logger.error('process request error', err);
      throw new CustomError('Internal Server Error');
    }
  }
}
