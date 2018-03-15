// @flow
import type {Fiber} from './ReactFiber';

export type CapturedValue<T> = {
  value: T,
  source: Fiber | null,
  stack: string | null,
};
