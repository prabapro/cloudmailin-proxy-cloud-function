// apps/aquafina-invoice/config.js

// App-scoped configuration. Env vars are namespaced with the app prefix
// (AQUAFINA_INVOICE_) so each app under this proxy owns its own settings
// without colliding with others.
const config = {
  endpoint: process.env.AQUAFINA_INVOICE_ENDPOINT,
};

const requiredKeys = ['endpoint'];

for (const key of requiredKeys) {
  if (!config[key]) {
    throw new Error(`Missing required environment variable for: ${key}`);
  }
}

export default config;
