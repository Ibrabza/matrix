import Router from './router/Router.tsx';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme.tsx';
import { AuthProvider } from './hooks/useAuth.tsx';
import { StoreProvider } from './stores';
import { QueryProvider } from './lib/QueryProvider.tsx';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <StoreProvider>
          <ThemeProvider>
            <BrowserRouter>
              <Router />
            </BrowserRouter>
          </ThemeProvider>
        </StoreProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
