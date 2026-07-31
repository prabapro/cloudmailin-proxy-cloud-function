// apps/bank-otp/notifications/slack.js

import axios from 'axios';

import config from '../config.js';

// GCP project details, used to build the "Triggered by" context links. These
// mirror the values in the deploy script (see package.json).
const GCP_PROJECT = 'hoptira-internal-ops';
const GCP_REGION = 'asia-south1';
const GCP_SERVICE = 'cloudmailin-proxy';

// Cloud Functions (Cloud Run) observability dashboard for this service.
const CLOUD_FUNCTION_URL = `https://console.cloud.google.com/run/detail/${GCP_REGION}/${GCP_SERVICE}/revisions?project=${GCP_PROJECT}`;

// Saved Cloud Logging view, pinned to a relative "last 1 day" range.
const LOGS_URL = 'https://cloudlogging.app.goo.gl/Y87YdqyzXpuA8yCD9';

// The card subtitle has a 150-character limit, so long subjects are truncated
// to stop a single oversized field from getting the whole message rejected.
const SUBTITLE_MAX_LENGTH = 150;

/**
 * Shorten text to a maximum length, appending an ellipsis when trimmed.
 *
 * @param {string} text
 * @param {number} max
 * @returns {string}
 */
function truncate(text, max) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/**
 * Post an OTP to Slack as a Block Kit card. The OTP is rendered as inline code
 * so it can be double-clicked to select and copy, and a context row links back
 * to the Cloud Function dashboard and its logs for auditing.
 *
 * @param {{ bank: string, otp: string, subject: string }} params
 */
async function sendOtpToSlack({ bank, otp, subject }) {
  const card = {
    type: 'card',
    title: {
      type: 'mrkdwn',
      text: `🏦 ${bank}`,
      verbatim: false,
    },
    body: {
      type: 'mrkdwn',
      text: `\`${otp}\``,
      verbatim: false,
    },
  };

  // Subject is optional, so only add a subtitle when the email carried one.
  if (subject) {
    card.subtitle = {
      type: 'mrkdwn',
      text: truncate(subject, SUBTITLE_MAX_LENGTH),
      verbatim: false,
    };
  }

  const message = {
    // Fallback text shown in notifications and on unsupported clients.
    text: `${otp} from ${bank}`,
    blocks: [
      card,
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `${otp} from ${bank} · Triggered by <${CLOUD_FUNCTION_URL}|Cloud Functions> · <${LOGS_URL}|View logs>`,
          },
        ],
      },
    ],
  };

  await axios.post(config.slackWebhookUrl, message);
}

export { sendOtpToSlack };
