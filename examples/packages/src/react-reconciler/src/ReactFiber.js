// @flow
import type {Source} from 'shared/ReactElementType';
import type {RefObject} from 'shared/ReactTypes';
import type {TypeOfWork} from 'shared/ReactTypeOfWork';
import type {TypeOfMode} from './ReactTypeOfMode';
import type {TypeOfSideEffect} from 'shared/ReactTypeOfSideEffect';
import type {ExpirationTime} from './ReactFiberExpirationTime';
import type {UpdateQueue} from './ReactFiberUpdateQueue';

export type Fiber = {|
  tag: TypeOfWork,
  key: null | string,
  type: any,
  stateNode: any,
  return: Fiber | null,
  child: Fiber | null,
  sibling: Fiber | null,
  index: number,
  ref: null | (((handle: mixed) => void) & {_stringRef: ?string}) | RefObject,
  pendingProps: any,
  memoizedProps: any,
  updateQueue: UpdateQueue<any> | null,
  memorizedState: any,
  mode: TypeOfMode,
  effectTag: TypeOfSideEffect,
  nextEffect: Fiber | null,
  firstEffect: Fiber | null,
  lastEffect: Fiber | null,
  expirationTime: ExpirationTime,
  alternate: Fiber | null,

  _debugID?: number,
  _debugSource?: Source | null,
  _debugOwner?: Fiber | null,
  _debugIsCurrentlyTiming?: boolean,
|};
