export function toMilliseconds(timeInMinutes: number) {
  return timeInMinutes * 60 * 1000;
}

export function toMinutes(timeInMilliseconds: number) {
  return timeInMilliseconds / 1000 / 60;
}
