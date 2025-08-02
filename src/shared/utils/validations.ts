export function require(value: boolean, lazyMessage: () => string) {
  if (!value) {
    const messaege = lazyMessage();
    throw new ValidationError(`Validation throw: ${messaege}`);
  }
}

export class ValidationError extends Error {}
