import { ComponentPropsWithRef } from 'react';

export type TextareaProps = ComponentPropsWithRef<'textarea'> & {
  label: string;
  hint?: string;
  error?: string;
};
