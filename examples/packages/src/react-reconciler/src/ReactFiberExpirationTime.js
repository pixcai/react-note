// @flow
export type ExpirationTime = number;

export const NoWork = 0;
export const Sync = 1;

const UNIT_SIZE = 10;
const MAGIC_NUMBER_OFFSET = 2;

export function msToExpirationTime(ms: number): ExpirationTime {
  return ((ms / UNIT_SIZE) | 0) + MAGIC_NUMBER_OFFSET;
}
