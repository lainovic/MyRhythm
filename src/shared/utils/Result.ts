export class Result<T, E> {
  private readonly _isSuccess: boolean;
  private readonly _value?: T;
  private readonly _error?: E;

  private constructor(isSuccess: boolean, value?: T, error?: E) {
    this._isSuccess = isSuccess;
    this._value = value;
    this._error = error;
  }

  static success<T, E = unknown>(value: T): Result<T, E> {
    return new Result<T, E>(true, value);
  }

  static error<E, T = unknown>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  isSuccess(): boolean {
    return this._isSuccess;
  }

  isError(): boolean {
    return !this._isSuccess;
  }

  value(): T {
    return this._value!;
  }

  error(): E {
    return this._error!;
  }

  ifSuccess(fn: (result: T) => void): Result<T, E> {
    if (this.isSuccess()) {
      fn(this.value());
    }
    return this;
  }

  ifError(fn: (error: E) => void): Result<T, E> {
    if (this.isError()) {
      fn(this.error());
    }
    return this;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isSuccess()) {
      return Result.success(fn(this._value!));
    }
    return Result.error(this._error!);
  }

  mapError<U>(fn: (value: E) => U): Result<T, U> {
    if (this.isError()) {
      return Result.error(fn(this._error!));
    }
    return Result.success(this._value!);
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isSuccess()) {
      return fn(this._value!);
    }
    return Result.error(this._error!);
  }
}
