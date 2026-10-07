import type { LoginFormValues } from '../../schemas';

export type LoginFormProps = {
  onSubmit: (values: LoginFormValues) => Promise<void>;
};
