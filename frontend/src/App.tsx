import { AppLayout } from '@components';
import { AskPage } from '@modules/ask';
import { LoginPage } from '@modules/auth';
import { DocumentPage } from '@modules/documents';
import { NotFoundPage } from '@pages';
import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<AskPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="documents/:documentId" element={<DocumentPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
