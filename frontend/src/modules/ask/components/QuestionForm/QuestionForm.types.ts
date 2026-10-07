import type { QuestionFormValues } from '../../schemas';

export type QuestionFormProps = {
  onSubmit: (values: QuestionFormValues) => Promise<void>;
};
