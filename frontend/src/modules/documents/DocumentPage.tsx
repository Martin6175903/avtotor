import { Alert } from '@components';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { DocumentContent } from '.';
import styles from './DocumentPage.module.scss';

export const DocumentPage = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [attempt, setAttempt] = useState(0);

  return (
    <div className={styles.page}>
      <Link className={styles.backLink} to="/">
        К вопросам
      </Link>

      {documentId ? (
        <DocumentContent
          key={`${documentId}:${attempt}`}
          documentId={documentId}
          onRetry={() => setAttempt((value) => value + 1)}
        />
      ) : (
        <Alert variant="error">Не указан документ.</Alert>
      )}
    </div>
  );
};
