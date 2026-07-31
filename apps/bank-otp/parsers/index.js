// apps/bank-otp/parsers/index.js

import combank from './combank.js';
import hnb from './hnb.js';
import ntb from './ntb.js';

// Register every supported bank here. Adding a new bank is a one-line change
// plus its own parser file.
const parsers = [combank, hnb, ntb];

/**
 * Pull the bare email address out of a `from` header, which may arrive as
 * either "cards@combank.net" or "HNB <mobilebanking@hnb.lk>".
 */
function extractEmail(from) {
  const angle = from.match(/<([^>]+)>/);
  return (angle ? angle[1] : from).trim();
}

/**
 * Extract the lower-cased domain from a `from` header.
 */
function extractDomain(from) {
  if (!from) return null;

  const email = extractEmail(from);
  const at = email.lastIndexOf('@');
  if (at === -1) return null;

  return email.slice(at + 1).toLowerCase();
}

/**
 * Match a sender domain to a registered parser. Matches the domain exactly or
 * as a sub-domain (e.g. "otp.nationstrust.com" -> "nationstrust.com").
 */
function findParser(from) {
  const domain = extractDomain(from);
  if (!domain) return null;

  return (
    parsers.find(
      (p) => domain === p.domain || domain.endsWith(`.${p.domain}`),
    ) || null
  );
}

/**
 * Identify the bank from the payload and extract the OTP.
 *
 * @param {object} payload - the full webhook payload
 * @returns {{ matched: boolean, bank: string|null, otp: string|null }}
 */
function parseOtp(payload) {
  const from = payload.headers && payload.headers.from;
  const parser = findParser(from);

  if (!parser) {
    return { matched: false, bank: null, otp: null };
  }

  return { matched: true, bank: parser.name, otp: parser.parse(payload) };
}

export { parseOtp };
