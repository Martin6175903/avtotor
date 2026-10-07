import { Link, useParams } from 'react-router-dom';

export const DocumentPage = () => {
  const { documentId } = useParams<{ documentId: string }>();

  return (
    <section>
      <Link to="/">К вопросам</Link>

      <h1>Документ</h1>
      <p>Идентификатор: {documentId}</p>
    </section>
  );
};
