// @flow
import type {HostConfig} from "react-reconciler";
import type {FiberRoot} from './ReactFiberRoot';
import type {ExpirationTime} from './ReactFiberExpirationTime';

import {msToExpirationTime} from './ReactFiberExpirationTime';

export default function<T, P, I, TI, HI, PI, C, CC, CX, PL>(
  config: HostConfig<T, P, I, TI, HI, PI, C, CC, CX, PL>,
) {
  let isBatchingUpdates: boolean = false;
  let isUnbatchingUpdates: boolean = false;

  const {
    now,
  } = config;

  const originalStartTimeMs = now();
  let mostRecentCurrentTime: ExpirationTime = msToExpirationTime(0);
  let mostRecentCurrentTimeMs: ExpirationTime = originalStartTimeMs;

  let lastUniqueAsyncExpiration: number = 0;

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

  function recalculateCurrentTime(): ExpirationTime {
    mostRecentCurrentTimeMs = now() - originalStartTimeMs;
    mostRecentCurrentTime = msToExpirationTime(mostRecentCurrentTimeMs);
    return mostRecentCurrentTime;
  }

  function computeUniqueAsyncExpiration(): ExpirationTime {
    const currentTime = recalculateCurrentTime();
    let result = computeAsyncExpiration(currentTime);
    if (result <= lastUniqueAsyncExpiration) {
      result = lastUniqueAsyncExpiration + 1;
    }
    lastUniqueAsyncExpiration = result;
    return lastUniqueAsyncExpiration;
  }

  function flushRoot(root: FiberRoot, expirationTime: ExpirationTime) {
    performWorkOnRoot(root, expirationTime, false);
    finishRendering();
  }

  return {
    computeUniqueAsyncExpiration,
    flushRoot,
    unbatchedUpdates,
  };
}
