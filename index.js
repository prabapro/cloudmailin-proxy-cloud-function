// index.js

import functions from '@google-cloud/functions-framework';

// ESM static imports are hoisted and evaluated before any top-level code here.
// `./app.js` transitively loads each app's `config.js`, which reads process.env
// at module-evaluation time and throws if a required var is missing. So dotenv
// must load BEFORE `./app.js` is evaluated.
//
// To guarantee that ordering, dotenv is loaded here (conditionally, since it is
// a devDependency and is absent in production) and `./app.js` is pulled in via
// dynamic import afterwards, so its evaluation happens only once the environment
// is ready. The framework import above is safe to keep static because it does
// not read our config at load time.
if (process.env.NODE_ENV !== 'production') {
  await import('dotenv/config');
}

const { default: app } = await import('./app.js');

functions.http('cloudmailinProxy', app);
