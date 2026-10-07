import { Alert } from '@components';
import { demoSubmission } from '@utils';

import styles from './AskPage.module.scss';
import { QuestionForm } from './components';

export const AskPage = () => {
  return (
    <section className={styles.page} aria-labelledby="ask-title">
      <div className={styles.heading}>
        <h1 className={styles.title} id="ask-title">
          Задать вопрос
        </h1>

        <p className={styles.description}>Найдите информацию в документах вашей организации.</p>
      </div>

      <Alert>Ответ формируется на основе документов, доступных вашей учётной записи.</Alert>

      <QuestionForm onSubmit={demoSubmission} />
    </section>
  );
};
