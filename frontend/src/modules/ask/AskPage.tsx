import { Alert } from '@components';
import { useAuth } from '@modules/auth/hooks';
import { ApiError } from '@services';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { askQuestion, AskResponse } from './api';
import styles from './AskPage.module.scss';
import { QuestionForm } from './components';
import type { QuestionFormValues } from './schemas';

export const AskPage = () => {
  const { expireSession } = useAuth();

  const [result, setResult] = useState<AskResponse | null>(null);
  const requestController = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      requestController.current?.abort();
    };
  }, []);

  const handleQuestion = async ({ question }: QuestionFormValues): Promise<void> => {
    requestController.current?.abort();

    const controller = new AbortController();
    requestController.current = controller;

    setResult(null);

    try {
      const response = await askQuestion(question, controller.signal);

      if (!controller.signal.aborted) {
        setResult(response);
      }
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        expireSession();
        return;
      }

      throw error;
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Задать вопрос</h1>

        <p className={styles.description}>Найдите информацию в документах вашей организации.</p>
      </div>

      <Alert>Ответ формируется на основе документов, доступных вашей учётной записи.</Alert>

      <QuestionForm onSubmit={handleQuestion} />

      <div>{result ? 'Ответ получен.' : ''}</div>

      {result && (
        <section className={styles.result}>
          <h2 className={styles.resultTitle}>Ответ</h2>

          <p className={styles.answer}>{result.answer}</p>

          {result.sources.length > 0 && (
            <div className={styles.sources}>
              <h3 className={styles.sourcesTitle}>Использованные источники</h3>

              <ul className={styles.sourceList}>
                {result.sources.map((source) => (
                  <li key={source.id}>
                    <Link
                      className={styles.sourceLink}
                      to={`/documents/${encodeURIComponent(source.id)}`}
                    >
                      {source.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </section>
  );
};
