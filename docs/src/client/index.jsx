import 'babel-polyfill';
import 'svgxuse';
import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';

import App from 'components/App';
import { updateLocale } from 'state/locale';
import { updateCustomTheme } from 'state/helmet';

import configureStore from './configureStore';
import loadIntl from './loadIntl';

import './styles.scss';

const store = configureStore(window.__INITIAL_STATE__);
const locale = window.navigator.userLanguage || window.navigator.language || 'en-US';

if (!navigator.onLine || !__SSR__) {
  // The custom theme needs to be dispatched when there is no SSR since the
  // custom theme would normally be pre-rendered by the server
  store.dispatch(updateCustomTheme(store.getState().theme.href));
}
// I don't do any server side locale stuff, so make sure the correctly locale is being used.
store.dispatch(updateLocale(locale));

const root = document.getElementById('app');
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.unregister();
  });
}

(async function doRender() {
  await loadIntl(locale);
  render(
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>,
    root
  );
}());
