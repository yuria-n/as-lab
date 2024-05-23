import { config } from './config';
import { singleton } from 'tsyringe';

export enum LogLevel {
  Debug = 20,
  Info = 30,
  Warn = 40,
  Error = 50,
}

@singleton()
export class Logger {
  private readonly logLevel = config.debug ? LogLevel.Debug : LogLevel.Info;

  debug(message: string, ...data: any[]) {
    this.log(LogLevel.Debug, message, data);
  }

  info(message: string, ...data: any[]) {
    this.log(LogLevel.Info, message, data);
  }

  warn(message: string, ...data: any[]) {
    this.log(LogLevel.Warn, message, data);
  }

  error(message: string, ...data: any[]) {
    this.log(LogLevel.Error, message, data);
  }

  private log = (level: LogLevel, message: string, args: any[]) => {
    if (level < this.logLevel) {
      return;
    }
    const error = args.find((arg) => arg instanceof Error);
    const stack = level !== LogLevel.Error ? undefined : error?.stack ?? new Error().stack;
    const err = error?.mesage;
    args = args.filter((arg) => arg !== error);
    const data = args.length <= 1 ? { ...args[0], err } : { args, err };
    console.log(
      JSON.stringify({
        level,
        time: Date.now(),
        message,
        stack,
        data,
      }),
    );
  };
}
