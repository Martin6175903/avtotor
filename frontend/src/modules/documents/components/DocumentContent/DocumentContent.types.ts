import { DocumentResponse } from '../../api';

export type DocumentState =
  | { status: 'loading' }
  | { status: 'success'; document: DocumentResponse }
  | { status: 'error'; message: string };

export type DocumentContentProps = {
  documentId: string;
  onRetry: () => void;
};
