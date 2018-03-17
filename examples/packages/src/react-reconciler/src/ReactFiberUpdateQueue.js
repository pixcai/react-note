// @flow
import type {Fiber} from './ReactFiber';
import type {ExpirationTime} from "./ReactFiberExpirationTime";
import type {CapturedValue} from './ReactCapturedValue';

import {NoWork} from './ReactFiberExpirationTime';

type PartialState<State, Props> =
  | $Subtype<State>
  | ((prevState: State, props: Props) => $Subtype<State>);

type Callback = mixed;

export type Update<State> = {
  expirationTime: ExpirationTime,
  partialState: PartialState<any, any>,
  callback: Callback | null,
  isReplace: boolean,
  isForced: boolean,
  capturedValue: CapturedValue<mixed> | null,
  next: Update<State> | null,
};

export type UpdateQueue<State> = {
  baseState: State,
  expirationTime: ExpirationTime,
  first: Update<State> | null,
  last: Update<State> | null,
  callbackList: Array<Update<State>> | null,
  hasForceUpdate: boolean,
  isInitialized: boolean,
  capturedValues: Array<CapturedValue<mixed>> | null,
  isProcessing?: boolean,
};

function createUpdateQueue<State>(baseState: State): UpdateQueue<State> {
  const queue: UpdateQueue<State> = {
    baseState,
    expirationTime: NoWork,
    first: null,
    last: null,
    callbackList: null,
    hasForceUpdate: false,
    isInitialized: false,
    capturedValues: null,
  };
  return queue;
}

export function insertUpdateIntoQueue<State>(
  queue: UpdateQueue<State>,
  update: Update<State>,
): void {
  if (queue.last === null) {
    queue.first = queue.last = update;
  } else {
    queue.last.next = update;
    queue.last = update;
  }
  if (
    queue.expirationTime === NoWork ||
    queue.expirationTime > update.expirationTime
  ) {
    queue.expirationTime = update.expirationTime;
  }
}

let q1;
let q2;

export function ensureUpdateQueues(fiber: Fiber) {
  q1 = q2 = null;
  const alternateFiber = fiber.alternate;
  let queue1 = fiber.updateQueue;
  if (queue1 === null) {
    queue1 = fiber.updateQueue = createUpdateQueue((null: any));
  }

  let queue2;
  if (alternateFiber !== null) {
    queue2 = alternateFiber.updateQueue;
    if (queue2 === null) {
      queue2 = alternateFiber.updateQueue = createUpdateQueue((null: any));
    }
  } else {
    queue2 = null;
  }
  queue2 = queue2 !== queue1 ? queue2 : null;
  q1 = queue1;
  q2 = queue2;
}

export function insertUpdateIntoFiber<State>(
  fiber: Fiber,
  update: Update<State>,
): void {
  ensureUpdateQueues(fiber);
  const queue1: Fiber = (q1: any);
  const queue2: Fiber | null = (q2: any);

  if (queue2 === null) {
    insertUpdateIntoQueue(queue1, update);
    return;
  }
  if (queue1.last === null || queue2.last === null) {
    insertUpdateIntoQueue(queue1, update);
    insertUpdateIntoQueue(queue2, update);
    return;
  }

  insertUpdateIntoQueue(queue1, update);
  queue2.last = update;
}
