export function requireNotNull<T>(value: T) {
  if (!value) throw new AssertionError("Value must not be null or undefined");
}

export function requireTrue<T>(value: T) {
  if (!value)
    throw new AssertionError("Assertion failed: value must be truthy");
}

export class AssertionError extends Error {}
