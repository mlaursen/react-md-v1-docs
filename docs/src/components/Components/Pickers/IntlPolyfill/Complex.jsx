import React from 'react';

import Markdown from 'components/Markdown';

import client from '!!raw-loader!client/index.jsx';
import loadIntl from '!!raw-loader!client/loadIntl.js';

const markdown = `
If you want a more detailed example, here is how this documentation server is polyfilled:

\`\`\`jsx
/* src/client/index.jsx */
${client}
\`\`\`

\`\`\`jsx
/* src/client/loadIntl.js */
${loadIntl}
\`\`\`

\`\`\`jsx
/* src/client/render.jsx */
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import * as Routes from 'routes';
import App from 'components/App';

import loadIntl from './loadIntl';
import { unregister as registerServiceWorker } from './registerServiceWorker';

/**
 * Renders the application after it has been server side rendered. It will wait
 * for any inlt polyfills to be loaded and all the required split code chunks
 * have been resolved and loaded before rendering the page to prevent screen
 * flashing.
 *
 * @param {HTMLElement} root - The root node to render the app in.
 * @param {Object} store - The current redux store
 * @param {String} locale - The current user's locale to use.
 */
export default async function render(root, store, locale) {
  const bundles = window.__WEBPACK_BUNDLES__ || [];
  await Promise.all([
    loadIntl(locale),
    ...bundles.map(chunk => Routes[chunk].loadComponent()),
  ]);

  ReactDOM.hydrate(
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>,
    root
  );

  registerServiceWorker(store);
}
\`\`\`
`;

const Complex = () => <Markdown markdown={markdown} />;
export default Complex;
