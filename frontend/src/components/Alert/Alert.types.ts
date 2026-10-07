import type { ComponentPropsWithoutRef } from 'react';

type AlertVariants = 'info' | 'error';
type AnnouncementVariants = 'off' | 'polite' | 'assertive';

export type AlertProps = Omit<ComponentPropsWithoutRef<'div'>, 'role' | 'aria-live'> & {
  variant?: AlertVariants;
  announcement?: AnnouncementVariants;
};
