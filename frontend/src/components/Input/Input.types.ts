import { ComponentPropsWithRef } from 'react';

export type InputProps = Omit<ComponentPropsWithRef<'input'>, 'type'> & {
  label: string;
  type?: 'text' | 'email' | 'password' | 'search';
  hint?: string;
  error?: string;
};
