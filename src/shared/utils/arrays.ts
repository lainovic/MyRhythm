export function none<T>(arr: T[], predicate: (e: T) => boolean): boolean {
  return !arr.some(predicate);
}
