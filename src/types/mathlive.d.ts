import * as React from 'react';

export interface MathFieldElementTarget extends HTMLElement {
  value: string;
  smartMode: boolean;
  mathVirtualKeyboardPolicy: 'auto' | 'manual' | 'sandboxed';
  getValue(format?: string): string;
  setValue(value: string, options?: { silenceNotifications?: boolean }): void;
  executeCommand(command: string | [string, ...unknown[]]): void;
}

type MathFieldAttributes = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<MathFieldElementTarget>;
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
