import React from 'react';
import ReactDOM from 'react-dom/client';
import moment from 'moment';
import 'moment/locale/id';
import App from './App';

import '@fontsource/sen/400.css';
import '@fontsource/sen/500.css';
import '@fontsource/sen/600.css';
import '@fontsource/sen/700.css';

import 'antd/dist/antd.min.css';
import './global.css';

moment.locale('id');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
