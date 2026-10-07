import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <section>
      <h1>Страница не найдена</h1>
      <p>Проверьте адрес или вернитесь к вопросам.</p>

      <Link to="/">На главную</Link>
    </section>
  );
};
