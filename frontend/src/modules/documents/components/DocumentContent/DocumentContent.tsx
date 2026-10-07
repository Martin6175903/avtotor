import { Alert, Button } from '@components';
import { useAuth } from '@modules/auth/hooks';
import { getDocument } from '@modules/documents/api';
import { ApiError } from '@services';
import { useEffect, useState } from 'react';

import styles from './DocumentContent.module.scss';
import { DocumentContentProps, DocumentState } from './DocumentContent.types';

export const DocumentContent = ({ documentId, onRetry }: DocumentContentProps) => {
  const { expireSession } = useAuth();

  const [state, setState] = useState<DocumentState>({
    status: 'loading',
  });

  useEffect(() => {
    const controller = new AbortController();

    const loadDocument = async () => {
      try {
        const document = await getDocument(documentId, controller.signal);

        if (!controller.signal.aborted) {
          setState({
            status: 'success',
            document,
          });
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          expireSession();
          return;
        }

        setState({
          status: 'error',
          message: error instanceof ApiError ? error.message : 'Не удалось загрузить документ.',
        });
      }
    };

    void loadDocument();

    return () => controller.abort();
  }, [documentId, expireSession]);

  if (state.status === 'loading') {
    return <p role="status">Загружаем документ...</p>;
  }

  if (state.status === 'error') {
    return (
      <div className={styles.message}>
        <Alert variant="error" announcement="assertive">
          {state.message}
        </Alert>

        <Button variant="secondary" onClick={onRetry}>
          Повторить
        </Button>
      </div>
    );
  }

  return (
    <article className={styles.document}>
      <h1 className={styles.title}>{state.document.title}</h1>

      <p className={styles.text}>{state.document.text}</p>
    </article>
  );
};
