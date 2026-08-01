// apps/aquafina-invoice/index.js

import express from 'express';

import { handleRequest } from './handler.js';

const router = express.Router();

// CloudMailin delivers each forwarded email as a JSON POST to this app's path.
router.post('/', handleRequest);

export default router;
