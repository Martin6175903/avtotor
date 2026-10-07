import classNames from 'classnames';

import styles from './Alert.module.scss';
import { AlertProps } from './Alert.types';

export const Alert = ({
  children,
  className,
  variant = 'info',
  announcement = 'off',
  ...props
}: AlertProps) => {
  const role =
    announcement === 'assertive' ? 'alert' : announcement === 'polite' ? 'status' : undefined;

  return (
    <div {...props} role={role} className={classNames(styles.alert, styles[variant], className)}>
      {children}
    </div>
  );
};
