// apps/aquafina-invoice/handler.js

import axios from 'axios';

import config from './config.js';
import logger from '../../utilities/logger.js';

/**
 * Forward the payload as JSON to the configured endpoint.
 *
 * The endpoint is a Google Apps Script `doPost`, which replies with a 302
 * redirect to `script.googleusercontent.com`. axios follows redirects by
 * default, so that behaviour is left in place (and made explicit here).
 *
 * @param {object} payload - the parsed webhook body to forward
 * @returns {Promise<import('axios').AxiosResponse>}
 */
async function forwardToEndpoint(payload) {
  return axios.post(config.endpoint, payload, {
    headers: { 'Content-Type': 'application/json' },
    // Apps Script doPost answers with a 302 to script.googleusercontent.com,
    // so redirects must be followed to reach the final response.
    maxRedirects: 5,
    // Never let a slow endpoint hold the request open indefinitely.
    timeout: 15000,
  });
}

/**
 * Route handler for `POST /aquafina-invoice`. Receives a forwarded email as
 * JSON and relays it as-is to the external endpoint.
 *
 * The method is guaranteed to be POST by the router, so no method check is
 * needed here.
 *
 * The forward is awaited so any failure can be logged for auditing, but a
 * clean 200 is always returned to CloudMailin so it does not treat a failed
 * downstream call as a delivery failure and retry.
 */
async function handleRequest(req, res) {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      logger.warn('Ignored: invalid payload', { payload });
      res.status(400).json({
        status: 'error',
        message: 'Invalid payload',
      });
      return;
    }

    const subject = payload.headers && payload.headers.subject;

    try {
      await forwardToEndpoint(payload);
      logger.info('Forwarded invoice webhook', { subject });
    } catch (err) {
      // The forward failed, but we still ack CloudMailin with 200 so it does
      // not retry. The failure is logged with the full payload for auditing.
      logger.error('Failed to forward invoice webhook', {
        subject,
        error: err.message,
        payload,
      });
    }

    res.status(200).json({
      status: 'ok',
      message: 'Received',
    });
  } catch (err) {
    logger.error('Failed to process request', { error: err.message });
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
}

export { handleRequest };
