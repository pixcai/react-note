// @flow
import type {Source} from 'shared/ReactElementType';
import type {RefObject} from 'shared/ReactTypes';
import type {TypeOfWork} from 'shared/ReactTypeOfWork';
import type {TypeOfMode} from './ReactTypeOfMode';
import type {TypeOfSideEffect} from 'shared/ReactTypeOfSideEffect';
import type {ExpirationTime} from './ReactFiberExpirationTime';
import type {UpdateQueue} from './ReactFiberUpdateQueue';

import {NoEffect} from 'shared/ReactTypeOfSideEffect';
import {
  HostRoot,
} from 'shared/ReactTypeOfWork';

import {NoWork} from './ReactFiberExpirationTime';
import {NoContext, AsyncMode, StrictMode} from './ReactTypeOfMode';

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
|};

function FiberNode(
  tag: TypeOfWork,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
) {
  this.tag = tag;
  this.key = key;
  this.type = null;
  this.stateNode = null;
  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;
  this.ref = null;
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.mode = mode;
  this.effectTag = NoEffect;
  this.nextEffect = null;
  this.firstEffect = null;
  this.lastEffect = null;
  this.expirationTime = NoWork;
  this.alternate = null;
}

const createFiber = function(
  tag: TypeOfWork,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
): Fiber {
  return new FiberNode(tag, pendingProps, key, mode);
}

export function createHostRootFiber(isAsync: boolean): Fiber {
  const mode = isAsync ? AsyncMode | StrictMode : NoContext;
  return createFiber(HostRoot, null, null, mode);
}
