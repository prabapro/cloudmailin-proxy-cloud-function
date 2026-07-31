// apps/bank-otp/parsers/hnb.js

import * as cheerio from 'cheerio';

const name = 'Hatton National Bank (HNB)';
const domain = 'hnb.lk';

const SIX_DIGITS = /^\d{6}$/;

/**
 * HNB sends a rich HTML email. The OTP sits in a <span> that follows a
 * bold "Your verification code is" label. The markup contains several
 * other numbers (font sizes, phone, expiry minutes), so we anchor on the
 * label first and fall back to any span holding exactly six digits.
 *
 * @param {object} payload - the full webhook payload
 * @returns {string|null} the 6-digit OTP, or null if not found
 */
function parse(payload) {
  const html = payload.html;
  if (!html) return null;

  const $ = cheerio.load(html);

  // Preferred: the span next to the "verification code" label.
  let otp = null;
  $('b').each((_, el) => {
    if (otp) return;

    const label = $(el).text().trim().toLowerCase();
    if (!label.includes('verification code')) return;

    const span = $(el)
      .parent()
      .find('span')
      .filter((__, s) => SIX_DIGITS.test($(s).text().trim()))
      .first();

    if (span.length) otp = span.text().trim();
  });

  // Fallback: any span containing exactly a 6-digit code.
  if (!otp) {
    const span = $('span')
      .filter((_, s) => SIX_DIGITS.test($(s).text().trim()))
      .first();

    if (span.length) otp = span.text().trim();
  }

  return otp;
}

export default { name, domain, parse };
