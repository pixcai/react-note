// @flow
import type {Fiber} from './ReactFiber';

import {enableUserTimingAPI} from 'shared/ReactFeatureFlags';
import getComponentName from 'shared/getComponentName';

type MeasurementPhase = 
  | 'componentWillMount'
  | 'componentWillUnmount'
  | 'componentWillReceiveProps'
  | 'shouldComponentUpdate'
  | 'componentWillUpdate'
  | 'componentDidUpdate'
  | 'componentDidMount'
  | 'getChildContext';

const reactEmoji = '\u269B';
const warningEmoji = '\u26D4';
const supportsUserTiming = 
  typeof performance !== 'undefined' &&
  typeof performance.mark === 'function' &&
  typeof performance.clearMarks === 'function' &&
  typeof performance.measure === 'function' &&
  typeof performance.clearMeasures === 'function';

let currentPhase: MeasurementPhase | null = null;
let currentPhaseFiber: Fiber | null = null;

let isCommitting: boolean = false;
let hasScheduledUpdateInCurrentPhase: boolean = false;
const labelsInCurrentCommit: Set<string> = new Set();

const formatMarkName = (markName: string) => {
  return `${reactEmoji} ${markName}`;
};

const formatLabel = (label: string, warning: string | null) => {
  const prefix = warning ? `${warningEmoji} ` : `${reactEmoji} `;
  const suffix = warning ? ` Warning: ${warning}` : '';
  return `${prefix}${label}${suffix}`;
};

const beginMark = (markName: string) => {
  performance.mark(formatMarkName(markName));
};

const clearMark = (markName: string) => {
  performance.clearMarks(formatMarkName(markName));
};

const endMark = (label: string, markName: string, warning: string | null) => {
  const formattedMarkName = formatMarkName(markName);
  const formattedLabel = formatLabel(label, warning);
  try {
    performance.measure(formattedLabel, formattedMarkName);
  } catch (err) {

  }
  performance.clearMarks(formattedMarkName);
  performance.clearMeasures(formattedLabel);
};

const getFiberMarkName = (label: string, debugID: number) => {
  return `${label} (#${debugID})`;
};

const beginFiberMark = (
  fiber: Fiber,
  phase: MeasurementPhase | null,
): boolean => {
  const componentName = getComponentName(fiber);
  const debugID = ((fiber._debugID: any): number);
  const isMounted = fiber.alternate !== null;
  const label = getFiberLabel(componentName, isMounted, phase);

  if (isCommitting && labelsInCurrentCommit.has(label)) {
    return false;
  }
  labelsInCurrentCommit.add(label);

  const markName = getFiberMarkName(label, debugID)
  beginMark(markName);
};

const getFiberLabel = (
  componentName: string,
  isMounted: boolean,
  phase: MeasurementPhase | null,
) => {
  if (phase === null) {
    return `${componentName} [${isMounted ? 'update' : 'mount'}]`;
  } else {
    return `${componentName}.${phase}`;
  }
};

const clearFiberMark = (fiber: Fiber, phase: MeasurementPhase | null) => {
  const componentName = getComponentName(fiber);
  const debugID = ((fiber._debugID: any): number);
  const isMounted = fiber.alternate !== null;
  const label = getFiberLabel(componentName, isMounted, phase);
  const markName = getFiberMarkName(label, debugID);
  clearMark(markName);
};

const endFiberMark = (
  fiber: Fiber,
  phase: MeasurementPhase | null,
  warning: string | null,
) => {
  const componentName = getComponentName(fiber);
  const debugID = ((fiber._debugID: any): number);
  const isMounted = fiber.alternate !== null;
  const label = getFiberLabel(componentName, isMounted, phase);
  const markName = getFiberMarkName(label, debugID);
  endMark(label, markName, warning);
};

const clearPendingPhaseMeasurement = () => {
  if (currentPhase !== null && currentPhaseFiber !== null) {
    clearFiberMark(currentPhaseFiber, currentPhase);
  }
  currentPhaseFiber = null;
  currentPhase = null;
  hasScheduledUpdateInCurrentPhase = false;
}

export function startPhaseTimer(fiber: Fiber, phase: MeasurementPhase): void {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }
    clearPendingPhaseMeasurement();
    if (!beginFiberMark(fiber, phase)) {
      return;
    }
    currentPhaseFiber = fiber;
    currentPhase = phase;
  }
}

export function stopPhaseTimer(): void {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }
    if (currentPhase !== null && currentPhaseFiber !== null) {
      const warning = hasScheduledUpdateInCurrentPhase
        ? 'Scheduled a cascading update'
        : null;
      endFiberMark(currentPhaseFiber, currentPhase, warning);
    }
    currentPhase = null;
    currentPhaseFiber = null;
  }
}
