import React from 'react';
import ReactDOM from 'react-dom/client';
import moment from 'moment';
// @ts-expect-error -- moment locale has no type declarations
import 'moment/locale/id';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import App from './App';

import '@fontsource/sen/400.css';
import '@fontsource/sen/500.css';
import '@fontsource/sen/600.css';
import '@fontsource/sen/700.css';

import './global.css';

moment.locale('id');
dayjs.locale('id');
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
