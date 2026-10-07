import { ComponentPropsWithRef } from 'react';

type ButtonVariants = 'primary' | 'secondary';

export type ButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: ButtonVariants;
  isLoading?: boolean;
  loadingText?: string;
};
