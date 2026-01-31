import { RouterProvider } from 'react-router-dom';
import router from './routes';
import ErrorBoundary from './components/common/ErrorBoundary';
import GlobalSnackbar from './components/common/GlobalSnackbar';
import ConfirmDialog from './components/common/ConfirmDialog';

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <GlobalSnackbar />
      <ConfirmDialog />
    </ErrorBoundary>
  );
}

export default App
