// apps/bank-otp/handler.js

import { parseOtp } from './parsers/index.js';
import { sendOtpToSlack } from './notifications/slack.js';
import logger from '../../utilities/logger.js';

/**
 * Route handler for `POST /bank-otp`. Receives a forwarded email as JSON,
 * extracts the OTP for a known bank, and forwards it to Slack.
 *
 * The method is guaranteed to be POST by the router, so no method check is
 * needed here.
 *
 * Every request produces exactly one structured, single-line log entry that
 * carries the full webhook payload plus the outcome (bank and OTP on success,
 * or the reason it was ignored otherwise), so a failed notification can be
 * audited from GCP logs alone.
 *
 * Note: cases we intentionally skip (unknown sender, no OTP found) return 200
 * so the upstream email forwarder does not treat them as failures and retry.
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

    const { matched, bank, otp } = parseOtp(payload);
    const from = payload.headers && payload.headers.from;
    const subject = payload.headers && payload.headers.subject;

    if (!matched) {
      logger.warn('Ignored: unrecognised sender', { from, payload });
      res.status(200).json({
        status: 'ignored',
        message: 'Ignored: unrecognised sender',
        bank: null,
        otp: null,
      });
      return;
    }

    if (!otp) {
      logger.warn('Ignored: OTP not found', { bank, payload });
      res.status(200).json({
        status: 'ignored',
        message: `Ignored: OTP not found for ${bank}`,
        bank,
        otp: null,
      });
      return;
    }

    await sendOtpToSlack({ bank, otp, subject });

    logger.info('Forwarded OTP to Slack', { bank, otp, payload });
    res.status(200).json({
      status: 'success',
      message: `Forwarded ${bank} OTP to Slack`,
      bank,
      otp,
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
