// @flow
const hasSymbol = typeof Symbol === 'function' && Symbol.for;

export const REACT_CALL_TYPE = hasSymbol ? Symbol.for('react.call') : 0xeac8;
export const REACT_RETURN_TYPE = hasSymbol
  ? Symbol.for('react.return')
  : 0xeac9;
export const REACT_PORTAL_TYPE = hasSymbol
  ? Symbol.for('react.portal')
  : 0xeaca;
export const REACT_FRAGMENT_TYPE = hasSymbol
  ? Symbol.for('react.fragment')
  : 0xeacb;
