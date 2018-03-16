// @flow
import React from 'react';
import type {ReactNodeList} from 'shared/ReactTypes';
import type {
  FiberRoot,
  Batch as FiberRootBatch,
} from 'react-reconciler/src/ReactFiberRoot';

import ReactFiberReconciler from 'react-reconciler';
import {
  ELEMENT_NODE,
  DOCUMENT_NODE,
} from '../shared/HTMLNodeType';
import {ROOT_ATTRIBUTE_NAME} from '../shared/DOMProperty';

const DOMRenderer = ReactFiberReconciler({
  getPublicInstance(instance) {
    return instance;
  },
});

type Container = Element | Document;

type Batch = FiberRootBatch & {
  render(children: ReactNodeList): Work,
  then(onComplete: () => mixed): void,
  commit(): void,
  _root: Root,
  _hasChildren: boolean,
  _children: ReactNodeList,
  _callbacks: Array<() => mixed> | null,
  _didComplete: boolean,
};

function ReactBatch(root: ReactRoot) {
  const expirationTime = DOMRenderer.computeUniqueAsyncExpiration();
  this._expirationTime = expirationTime;
  this._root = root;
  this._next = null;
  this._callbacks = null;
  this._didComplete = false;
  this._hasChildren = false;
  this._children = null;
  this._defer = true;
}

ReactBatch.prototype.render = function(children: ReactNodeList) {
  this._hasChildren = true;
  this._children = children;
  const internalRoot = this._root._internalRoot;
  const expirationTime = this._expirationTime;
  const work = new ReactWork();
  DOMRenderer.updateContainerAtExpirationTime(
    children,
    internalRoot,
    null,
    expirationTime,
    work._onCommit,
  );
  return work;
};

ReactBatch.prototype.then = function(onComplete: () => mixed) {
  if (this._didComplete) {
    onComplete();
    return;
  }
  let callbacks = this._callbacks;
  if (callbacks === null) {
    callbacks = this._callbacks = [];
  }
  callbacks.push(onComplete);
};

ReactBatch.prototype.commit = function() {
  const internalRoot = this._root._internalRoot;
  let firstBatch = internalRoot.firstBatch;
  
  if (!this._hasChildren) {
    this._next = null;
    this._defer = false;
    return;
  }

  let expirationTime = this._expirationTime;

  if (firstBatch !== this) {
    if (this._hasChildren) {
      expirationTime = this._expirationTime = firstBatch._expirationTime;
      this.render(this._children);
    }

    let previous = null;
    let batch = firstBatch;
    while (batch !== this) {
      previous = batch;
      batch = batch._next;
    }
    previous._next = batch._next;
    this._next = firstBatch;
    firstBatch = internalRoot.firstBatch = this;
  }

  this._defer = false;
  DOMRenderer.flushRoot(internalRoot, expirationTime);

  const next = this._next;
  this._next = null;
  firstBatch = internalRoot.firstBatch = next;

  if (firstBatch !== null && firstBatch._hasChildren) {
    firstBatch.render(firstBatch._children);
  }
};

ReactBatch.prototype._onComplete = function() {
  if (this._didComplete) {
    return;
  }
  this._didComplete = true;
  const callbacks = this._callbacks;
  if (callbacks === null) {
    return;
  }
  for (let i = 0; i < callbacks.length; i++) {
    const callback = callbacks[i];
    callback();
  }
};

type Work = {
  then(onCommit: () => mixed): void,
  _onCommit: () => void,
  _callbacks: Array<() => mixed> | null,
  _didCommit: boolean,
};

function ReactWork() {
  this._callbacks = null;
  this._didCommit = false;
  this._onCommit = this._onCommit.bind(this);
}

ReactWork.prototype.then = function(onCommit: () => mixed): void {
  if (this._didCommit) {
    onCommit();
    return;
  }
  let callbacks = this._callbacks;
  if (callbacks === null) {
    callbacks = this._callbacks = [];
  }
  callbacks.push(onCommit);
};

ReactWork.prototype._onCommit = function(): void {
  if (this._didCommit) {
    return;
  }
  this._didCommit = true;
  const callbacks = this._callbacks;
  if (callbacks === null) {
    return;
  }
  for (let i = 0; i < callbacks.length; i++) {
    const callback = callbacks[i];
    callback();
  }
};

type Root = {
  render(children: ReactNodeList, callback: ?() => mixed): Work,
  unmount(callback: ?() => mixed): Work,
  legacy_renderSubtreeIntoContainer(
    parentComponent: ?React$Component<any, any>,
    children: ReactNodeList,
    callback: ?() => mixed,
  ): Work,
  createBatch(): Batch,
  _internalRoot: FiberRoot,
};

type DOMContainer =
  | (Element & {
    _reactRootContainer: ?Root,
  })
  | (Document & {
    _reactRootContainer: ?Root,
  })

function ReactRoot(container: Container, isAsync: boolean, hydrate: boolean) {
  const root = DOMRenderer.createContainer(container, isAsync, hydrate);
  this._internalRoot = root;
}

ReactRoot.prototype.render = function(
  children: ReactNodeList,
  callback: ?() => mixed,
): Work {
  const root = this._internalRoot;
  const work = new ReactWork();
  callback = callback === undefined ? null : callback;
  if (callback !== null) {
    work.then(callback);
  }
  DOMRenderer.updateContainer(children, root, null, work._onCommit);
  return work;
}

ReactRoot.prototype.unmount = function(callback: ?() => mixed): Work {
  const root = this._internalRoot;
  const work = new ReactWork();
  callback = callback === undefined ? null : callback;
  if (callback !== null) {
    work.then(callback);
  }
  DOMRenderer.updateContainer(null, root, null, work._onCommit);
  return work;
};

ReactRoot.prototype.legacy_renderSubtreeIntoContainer = function(
  parentComponent: ?React$Component<any, any>,
  children: ReactNodeList,
  callback: ?() => mixed,
): Work {
  const root = this._internalRoot;
  const work = new ReactWork();
  callback = callback === undefined ? null : callback;
  if (callback !== null) {
    work.then(callback);
  }
  DOMRenderer.updateContainer(children, root, parentComponent, work._onCommit);
  return work;
}

ReactRoot.prototype.createBatch = function(): Batch {
  const batch = new ReactBatch(this);
  const expirationTime = batch._expirationTime;
  const internalRoot = this._internalRoot;
  const firstBatch = internalRoot.firstBatch;
  
  if (firstBatch === null) {
    internalRoot.firstBatch = batch;
    batch._next = null;
  } else {
    let insertAfter = null;
    let insertBefore = firstBatch;
    while (
      insertBefore !== null &&
      insertBefore._expirationTime <= expirationTime
    ) {
      insertAfter = insertBefore;
      insertBefore = insertBefore._next;
    }
    batch._next = insertBefore;
    if (insertAfter !== null) {
      insertAfter._next = batch;
    }
  }

  return batch;
}

function getReactRootElementInContainer(container: any) {
  if (!container) {
    return null;
  }
  if (container.nodeType === DOCUMENT_NODE) {
    return container.documentElement;
  } else {
    return container.firstChild;
  }
}

function shouldHydrateDueToLegacyHeuristic(container) {
  const rootElement = getReactRootElementInContainer(container);
  return !!(
    rootElement &&
    rootElement.nodeType === ELEMENT_NODE &&
    rootElement.hasAttribute(ROOT_ATTRIBUTE_NAME)
  );
}

function legacyCreateRootFromDOMContainer(
  container: DOMContainer,
  forceHydrate: boolean,
): Root {
  const shouldHydrate =
    forceHydrate || shouldHydrateDueToLegacyHeuristic(container);
  if (!shouldHydrate) {
    let rootSibling;
    while ((rootSibling = container.lastChild)) {
      container.removeChild(rootSibling);
    }
  }
  const isAsync = false;
  return new ReactRoot(container, isAsync, shouldHydrate);
}

function legacyRenderSubtreeIntoContainer(
  parentComponent: ?React$Component<any, any>,
  children: ReactNodeList,
  container: DOMContainer,
  forceHydrate: boolean,
  callback: ?Function,
) {
  let root: Root = (container._reactRootContainer: any);

  if (!root) {
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
      container,
      forceHydrate,
    );
    if (typeof callback === 'function') {
      const originalCallback = callback;
      callback = function() {
        const instance = DOMRenderer.getPublicRootInstance(root._internalRoot);
        originalCallback.call(instance);
      };
    }
    DOMRenderer.unbatchedUpdates(() => {
      if (parentComponent !== null) {
        root.legacy_renderSubtreeIntoContainer(
          parentComponent,
          children,
          callback,
        );
      } else {
        root.render(children, callback);
      }
    });
  }

  return DOMRenderer.getPublicRootInstance(root._internalRoot);
}

const ReactDOM: Object = {
  render(
    element: React$Element<any>,
    container: DOMContainer,
    callback: ?Function,
  ) {
    return legacyRenderSubtreeIntoContainer(
      null,
      element,
      container,
      false,
      callback,
    );
  },
};

export default ReactDOM;
