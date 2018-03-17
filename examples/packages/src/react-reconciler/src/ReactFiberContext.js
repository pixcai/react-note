// @flow
import type {Fiber} from './ReactFiber';

import {ClassComponent, HostRoot} from 'shared/ReactTypeOfWork';
import {startPhaseTimer, stopPhaseTimer} from './ReactDebugFiberPerf';

export function isContextProvider(fiber: Fiber): boolean {
  return fiber.tag === ClassComponent && fiber.type.childContextTypes !== null;
}

export function processChildContext(
  fiber: Fiber,
  parentContext: Object,
): Object {
  const instance = fiber.stateNode;
  const childContextTypes = fiber.type.childContextTypes;

  if (typeof instance.getChildContext !== 'function') {
    return parentContext;
  }

  let childContext;
  startPhaseTimer(fiber, 'getChildContext');
  childContext = instance.getChildContext();
  stopPhaseTimer();
  
  return {...parentContext, ...childContext};
}

export function findCurrentUnmaskedContext(fiber: Fiber): Object {
  let node: Fiber = fiber;
  while (node.tag !== HostRoot) {
    if (isContextProvider(node)) {
      return node.stateNode.__reactInternalMemoizedMergedChildContext;
    }
    const parent = node.return;
    node = parent;
  }
  return node.stateNode.context;
}
