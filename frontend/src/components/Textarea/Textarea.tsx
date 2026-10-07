import classNames from 'classnames';
import { useId } from 'react';

import styles from './Textarea.module.scss';
import { TextareaProps } from './Textarea.types';

export const Textarea = ({
  label,
  hint,
  error,
  id,
  className,
  rows = 5,
  'aria-invalid': ariaInvalid,
  ...props
}: TextareaProps) => {
  const generatedId = useId();

  const textareaId = id ?? generatedId;
  const hintId = `${textareaId}-hint`;
  const errorId = `${textareaId}-error`;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={textareaId}>
        {label}
      </label>

      <textarea
        {...props}
        id={textareaId}
        rows={rows}
        className={classNames(styles.textarea, className)}
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
