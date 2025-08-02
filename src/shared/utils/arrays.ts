export function none<T>(arr: T[], predicate: (e: T) => boolean): boolean {
  return !arr.some(predicate);
}

export function flatten<T>(object: Record<string, any[]>): T[] {
  return Object.values(object).flat();
}
