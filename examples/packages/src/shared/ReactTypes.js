// @flow
import React from 'react';

export type ReactNode = 
  | React$Element<any>
  | ReactCall<any>
  | ReactReturn<any>
  | ReactPortal
  | ReactText
  | ReactFragment
  | ReactProvider<any>
  | ReactConsumer<any>;

export type ReactFragment = ReactEmpty | Iterable<React$Node>;

export type ReactNodeList = ReactEmpty | React$Node;

export type ReactText = string | number;

export type ReactEmpty = null | void | boolean;

export type ReactCall<V> = {
  $$typeof: Symbol | number,
  type: Symbol | number,
  key: null | string,
  ref: null,
  props: {
    props: any,
    handler: (props: any, returns: Array<V>) => ReactNodeList,
    children?: ReactNodeList,
  },
};

export type ReactReturn<V> = {
  $$typeof: Symbol | number,
  type: Symbol | number,
  key: null,
  ref: null,
  props: {
    value: V,
  },
};

export type ReactProvider<T> = {
  $$typeof: Symbol | number,
  type: ReactProviderType<T>,
  key: null | string,
  ref: null,
  props: {
    value: T,
    children?: ReactNodeList,
  },
};

export type ReactProviderType<T> = {
  $$typeof: Symbol | number,
  context: ReactContext<T>,
};

export type ReactConsumer<T> = {
  $$typeof: Symbol | number,
  type: ReactContext<T>,
  key: null | string,
  ref: null,
  props: {
    children: (value: T) => ReactNodeList,
    bits?: number,
  },
};

export type ReactContext<T> = {
  $$typeof: Symbol | number,
  Consumer: ReactContext<T>,
  Provider: ReactProviderType<T>,
  calculateChangedBits: ((a: T, b: T) => number) | null,
  defaultValue: T,
  currentValue: T,
  changedBits: number,
  _currentRenderer?: Object | null,
};

export type ReactPortal = {
  $$typeof: Symbol | number,
  key: null | string,
  containerInfo: any,
  children: ReactNodeList,
  implementation: any,
};

export type RefObject = {|
  value: any,
|};
