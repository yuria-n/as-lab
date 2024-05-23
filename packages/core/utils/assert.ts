export class AssertionError extends Error {}

export function assert(value: any, message?: string | Error): asserts value {
  if (value) {
    return value;
  }
  if (message instanceof Error) {
    throw message;
  }
  throw new AssertionError(message);
}
