// apps/bank-otp/config.js

// App-scoped configuration. Env vars are namespaced with the app prefix
// (BANK_OTP_) so each app under this proxy owns its own settings without
// colliding with others.
const config = {
  slackWebhookUrl: process.env.BANK_OTP_SLACK_WEBHOOK_URL,
};

const requiredKeys = ['slackWebhookUrl'];

for (const key of requiredKeys) {
  if (!config[key]) {
    throw new Error(`Missing required environment variable for: ${key}`);
  }
}

export default config;
