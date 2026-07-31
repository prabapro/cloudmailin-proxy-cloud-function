// apps/bank-otp/parsers/combank.js

const name = 'Commercial Bank (ComBank)';
const domain = 'combank.net';

/**
 * ComBank sends a plain-text email. The OTP appears as:
 *   "... for LKR 100.00 is 123456. Please use this code ..."
 *
 * @param {object} payload - the full webhook payload
 * @returns {string|null} the 6-digit OTP, or null if not found
 */
function parse(payload) {
  const text = payload.plain;
  if (!text) return null;

  const match = text.match(/\bis\s+(\d{6})\b/i);
  return match ? match[1] : null;
}

export default { name, domain, parse };
