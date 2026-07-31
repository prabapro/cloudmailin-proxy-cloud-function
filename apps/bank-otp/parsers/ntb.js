// apps/bank-otp/parsers/ntb.js

const name = 'Nations Trust Bank (NTB)';
const domain = 'nationstrust.com';

/**
 * NTB sends a plain-text email. The OTP appears as:
 *   "... Please enter OTP 123456 to complete the transaction ..."
 *
 * @param {object} payload - the full webhook payload
 * @returns {string|null} the 6-digit OTP, or null if not found
 */
function parse(payload) {
  const text = payload.plain;
  if (!text) return null;

  const match = text.match(/\bOTP\s+(\d{6})\b/i);
  return match ? match[1] : null;
}

export default { name, domain, parse };
