import { Link, useParams } from 'react-router-dom';

import styles from './DocumentPage.module.scss';

export const DocumentPage = () => {
  const { documentId } = useParams<{ documentId: string }>();

  return (
    <section className={styles.page}>
      <Link to="/">К вопросам</Link>

      <h1 className={styles.heading}>Документ</h1>
      <p className={styles.description}>Идентификатор: {documentId}</p>
    </section>
  );
};
