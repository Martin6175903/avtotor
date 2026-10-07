import classNames from 'classnames';

import styles from './Button.module.scss';
import { ButtonProps } from './Button.types';

export const Button = ({
  children,
  className,
  variant = 'primary',
  isLoading = false,
  loadingText = 'Загрузка...',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      type={type}
      className={classNames(styles.button, styles[variant], className)}
      disabled={disabled || isLoading}
    >
      {isLoading ? loadingText : children}
    </button>
  );
};
