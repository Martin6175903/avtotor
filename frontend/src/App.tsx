import { AppLayout } from '@components';
import { AskPage } from '@modules/ask';
import { LoginPage, RequireAuth, SessionGate } from '@modules/auth';
import { DocumentPage } from '@modules/documents';
import { NotFoundPage } from '@pages';
import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route element={<SessionGate />}>
          <Route path="login" element={<LoginPage />} />

          <Route element={<RequireAuth />}>
            <Route index element={<AskPage />} />
            <Route path="documents/:documentId" element={<DocumentPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
