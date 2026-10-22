import * as React from 'react';

type MathFieldAttributes = React.HTMLAttributes<HTMLElement> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref?: React.Ref<any>;
  class?: string;
  disabled?: boolean;
  'read-only'?: boolean;
  'default-mode'?: string;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': MathFieldAttributes;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': MathFieldAttributes;
    }
  }
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': MathFieldAttributes;
    }
  }
}

export {};
