import { Alert, Textarea } from '@components';
import { useState } from 'react';

import styles from './AskPage.module.scss';

const QUESTION_MAX_LENGTH = 2000;

export const AskPage = () => {
  const [question, setQuestion] = useState('');

  return (
    <section className={styles.page} aria-labelledby="ask-title">
      <div className={styles.heading}>
        <h1 className={styles.title} id="ask-title">
          Задать вопрос
        </h1>

        <p className={styles.description}>Найдите информацию в документах вашей организации.</p>
      </div>

      <Alert>Ответ формируется на основе документов, доступных вашей учётной записи.</Alert>

      <Textarea
        label="Ваш вопрос"
        name="question"
        placeholder="Например: как оформить отпуск?"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        maxLength={QUESTION_MAX_LENGTH}
        hint={`${question.length} / ${QUESTION_MAX_LENGTH} символов`}
      />
    </section>
  );
};
