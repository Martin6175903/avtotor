import classNames from 'classnames';
import { useId } from 'react';

import styles from './Input.module.scss';
import { InputProps } from './Input.types';

export const Input = ({
  label,
  type = 'text',
  hint,
  error,
  id,
  className,
  'aria-invalid': ariaInvalid,
  ...props
}: InputProps) => {
  const generatedId = useId();

  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>

      <input
        {...props}
        id={inputId}
        type={type}
        className={classNames(styles.input, className)}
        aria-invalid={error ? true : ariaInvalid}
      />

      {hint && (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      )}

      {error && (
        <p className={styles.error} id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
};
