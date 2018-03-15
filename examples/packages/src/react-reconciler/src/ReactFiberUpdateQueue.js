// @flow
import type {ExpirationTime} from "./ReactFiberExpirationTime";
import type {CapturedValue} from './ReactCapturedValue';

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
