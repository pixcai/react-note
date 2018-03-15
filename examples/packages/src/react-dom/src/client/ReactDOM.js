// @flow
import React from 'react';
import type {ReactNodeList} from 'shared/ReactTypes';
import type {
  FiberRoot,
  Batch as FiberRootBatch,
} from 'react-reconciler/src/ReactFiberRoot';

import ReactFiberReconciler from 'react-reconciler';

const DOMRenderer = ReactFiberReconciler({
  getPublicRootInstance(instance) {
    return instance;
  },
});

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

type Work = {
  then(onCommit: () => mixed): void,
  _onCommit: () => void,
  _callbacks: Array<() => mixed> | null,
  _didCommit: boolean,
};

type Root = {
  render(children: ReactNodeList, callback: ?() => mixed): Work,
  unmount(callback: ?() => mixed): Work,
  legacy_renderSubtreeIntoContainer(
    parentComponent: ?React$Component<any, any>,
    children: ReactNodeList,
    callback: ?() => mixed,
  ): Work,
  createBatch() : Batch,
  _internalRoot: FiberRoot,
};

type DOMContainer =
  | (Element & {
    _reactRootContainer: ?Root,
  })
  | (Document & {
    _reactRootContainer: ?Root,
  })

function legacyCreateRootFromDOMContainer(
  container: DOMContainer,
  forceHydrate: boolean,
): Root {

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
