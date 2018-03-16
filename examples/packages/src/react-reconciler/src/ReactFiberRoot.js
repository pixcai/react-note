// @flow
import type {Fiber} from './ReactFiber';
import type {ExpirationTime} from './ReactFiberExpirationTime';

import {createHostRootFiber} from './ReactFiber';
import {NoWork} from './ReactFiberExpirationTime';

export type Batch = {
  _defer: boolean,
  _expirationTime: ExpirationTime,
  _onComplete: () => mixed,
  _next: Batch | null,
};

export type FiberRoot = {
  containerInfo: any,
  pendingChildren: any,
  current: Fiber,
  pendingCommitExpirationTime: ExpirationTime,
  finishedWork: Fiber | null,
  context: Object | null,
  pendingContext: Object | null,
  +hydrate: boolean,
  remainingExpirationTime: ExpirationTime,
  firstBatch: Batch | null,
  nextScheduledRoot: FiberRoot | null,
};

export function createFiberRoot(
  containerInfo: any,
  isAsync: boolean,
  hydrate: boolean,
): FiberRoot {
  const uninitializedFiber = createHostRootFiber(isAsync);
  const root = {
    current: uninitializedFiber,
    containerInfo,
    pendingChildren: null,
    pendingCommitExpirationTime: NoWork,
    finishedWork: null,
    context: null,
    pendingContext: null,
    hydrate,
    remainingExpirationTime: NoWork,
    firstBatch: null,
    nextScheduledRoot: null,
  };
  uninitializedFiber.stateNode = root;
  return root;
}
