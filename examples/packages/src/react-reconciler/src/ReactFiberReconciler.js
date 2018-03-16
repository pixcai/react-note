// @flow
import React from 'react';
import type {Fiber} from './ReactFiber';
import type {FiberRoot} from "./ReactFiberRoot";
import type {ReactNodeList} from 'shared/ReactTypes';
import type {ExpirationTime} from './ReactFiberExpirationTime';
import {HostComponent} from "shared/ReactTypeOfWork";

import ReactFiberScheduler from './ReactFiberScheduler';

type OpaqueRoot = FiberRoot;

export type HostConfig<T, P, I, TI, HI, PI, C, CC, CX, PL> = {
  getPublicInstance(instance: I | TI): PI,
  now(): number,
};

export type Reconciler<C, I, TI> = {
  createContainer(
    containerInfo: C,
    isAsync: boolean,
    hydrate: boolean,
  ): OpaqueRoot,
  updateContainer(
    element: ReactNodeList,
    container: OpaqueRoot,
    parentComponent: ?React$Component<any, any>,
    callback: ?Function,
  ): ExpirationTime,
  updateContainerAtExpirationTime(
    element: ReactNodeList,
    container: OpaqueRoot,
    parentComponent: ?React$Component<any, any>,
    expirationTime: ExpirationTime,
    callback: ?Function,
  ): ExpirationTime,
  flushRoot(root: OpaqueRoot, expirationTime: ExpirationTime): void,
  unbatchedUpdates<A>(fn: () => A): A,
  computeUniqueAsyncExpiration(): ExpirationTime,
  getPublicRootInstance(
    container: OpaqueRoot,
  ): React$Component<any, any> | TI | I | null,
};

export default function<T, P, I, TI, HI, PI, C, CC, CX, PL>(
  config: HostConfig<T, P, I, TI, HI, PI, C, CC, CX, PL>,
): Reconciler<C, I, TI> {
  const {getPublicInstance} = config;

  const {
    computeUniqueAsyncExpiration,
    flushRoot,
    unbatchedUpdates,
  } = ReactFiberScheduler(config);

  function scheduleRootUpdate(
    current: Fiber,
    element: ReactNodeList,
    currentTime: ExpirationTime,
    expirationTime: ExpirationTime,
    callback: ?Function,
  ) {
    callback = callback === undefined ? null : callback;
    const update = {
      expirationTime,
      partialState: {element},
      callback,
      isReplace: false,
      isForced: false,
      capturedValue: null,
      next: null,
    };
    insertUpdateIntoFiber(current, update);
    scheduleWork(current, expirationTime);

    return expirationTime;
  }

  function updateContainerAtExpirationTime(
    element: ReactNodeList,
    container: OpaqueRoot,
    parentComponent: ?React$Component<any, any>,
    currentTime: ExpirationTime,
    expirationTime: ExpirationTime,
    callback: ?Function,
  ) {
    const current = container.current;
    const context = getContextForSubtree(parentComponent);
    
    if (container.context === null) {
      container.context = context;
    } else {
      container.pendingContext = context;
    }

    return scheduleRootUpdate(
      current,
      element,
      currentTime,
      expirationTime,
      callback,
    );
  }

  return {
    createContainer(
      containerInfo: C,
      isAsync: boolean,
      hydrate: boolean,
    ): OpaqueRoot {
      return createFiberRoot(containerInfo, isAsync, hydrate);
    },

    updateContainer(
      element: ReactNodeList,
      container: OpaqueRoot,
      parentComponent: ?React$Component<any, any>,
      callback: ?Function,
    ): ExpirationTime {
      const current = container.current;
      const currentTime = recalculateCurrentTime();
      const expirationTime = computeExpirationForFiber(current);
      return updateContainerAtExpirationTime(
        element,
        container,
        parentComponent,
        currentTime,
        expirationTime,
        callback,
      );
    },

    updateContainerAtExpirationTime(
      element,
      container,
      parentComponent,
      expirationTime,
      callback,
    ) {
      const currentTime = recalculateCurrentTime();
      return updateContainerAtExpirationTime(
        element,
        container,
        parentComponent,
        currentTime,
        expirationTime,
        callback,
      );
    },

    flushRoot,

    computeUniqueAsyncExpiration,

    getPublicRootInstance(
      container: OpaqueRoot,
    ): React$Component<any, any> | PI | null {
      const containerFiber = container.current;
      if (!containerFiber.child) {
        return null;
      }
      switch (containerFiber.child.tag) {
        case HostComponent:
          return getPublicInstance(containerFiber.child.stateNode);
        default:
          return containerFiber.child.stateNode;
      }
    },
    
    unbatchedUpdates,
  };
}
