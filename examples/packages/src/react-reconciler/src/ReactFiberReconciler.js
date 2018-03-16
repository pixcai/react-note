// @flow
import React from 'react';
import type {FiberRoot} from "./ReactFiberRoot";
import type {ReactNodeList} from 'shared/ReactTypes';
import type {ExpirationTime} from './ReactFiberExpirationTime';
import {HostComponent} from "shared/ReactTypeOfWork";

import ReactFiberScheduler from './ReactFiberScheduler';

type OpaqueRoot = FiberRoot;

export type HostConfig<T, P, I, TI, HI, PI, C, CC, CX, PL> = {
  getPublicInstance(instance: I | TI): PI,
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
    expirationTime: ExpirationTime,
    callback: ?Function,
  ): ExpirationTime,
  updateContainerAtExpirationTime(
    element: ReactNodeList,
    container: OpaqueRoot,
    parentComponent: ?React$Component<any, any>,
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

  return {
    createContainer(
      containerInfo: C,
      isAsync: boolean,
      hydrate: boolean,
    ): OpaqueRoot {

    },

    updateContainer(
      element: ReactNodeList,
      container: OpaqueRoot,
      parentComponent: ?React$Component<any, any>,
      callback: ?Function,
    ): ExpirationTime {

    },

    updateContainerAtExpirationTime(
      element,
      container,
      parentComponent,
      expirationTime,
      callback,
    ) {

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
