export class CustomError extends Error {
  statusCode = 500;
  constructor(message: string) {
    super(message);
    Object.defineProperty(this, 'message', {
      enumerable: true,
    });
  }
}

export class BadRequestError extends CustomError {
  statusCode = 400;
  constructor(message = '') {
    super(message);
  }
}

export class UnauthorizedError extends CustomError {
  statusCode = 401;
  constructor(message = '') {
    super(message);
  }
}
