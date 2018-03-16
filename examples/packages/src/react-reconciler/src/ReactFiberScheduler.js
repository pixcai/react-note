// @flow
import type {HostConfig} from "react-reconciler";

export default function<T, P, I, TI, HI, PI, C, CC, CX, PL>(
  config: HostConfig<T, P, I, TI, HI, PI, C, CC, CX, PL>,
) {
  let isBatchingUpdates: boolean = false;
  let isUnbatchingUpdates: boolean = false;

  function unbatchedUpdates<A, R>(fn: (a: A) => R, a: A): R {
    if (isBatchingUpdates && !isUnbatchingUpdates) {
      isUnbatchingUpdates = true;
      try {
        return fn(a);
      } finally {
        isUnbatchingUpdates = false;
      }
    }
    return fn(a);
  }

  return {
    unbatchedUpdates,
  };
}
