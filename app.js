// app.js

import express from 'express';

import logger from './utilities/logger.js';
import bankOtp from './apps/bank-otp/index.js';
import aquafinaInvoice from './apps/aquafina-invoice/index.js';

const app = express();

// functions-framework already parses the JSON body before invoking this app, and
// express.json() is a no-op when the body was parsed upstream (body-parser sets
// `req._body`). Adding it here keeps the app correct when it is run standalone
// too, without double-parsing under the framework.
app.use(express.json());

// Lightweight liveness probe.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'cloudmailin-proxy' });
});

// Each CloudMailin app owns a path-scoped router. Register new apps here.
app.use('/bank-otp', bankOtp);
app.use('/aquafina-invoice', aquafinaInvoice);

// Nothing is mounted at this path.
app.use((req, res) => {
  logger.warn('Ignored: unknown path', {
    method: req.method,
    path: req.originalUrl,
  });
  res.status(404).json({
    status: 'error',
    message: 'Not Found',
  });
});

export default app;
