// @flow
import type {Fiber} from './ReactFiber';
import type {ExpirationTime} from './ReactFiberExpirationTime';

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
