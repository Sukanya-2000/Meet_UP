import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { store } from './redux/store';
import './index.css';
import { I18nProvider } from './i18n';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
      <I18nProvider><App /></I18nProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
