// utilities/logger.js

// Leaf emoji prefixes scoped entries so a given app's logs can be spotted at a
// glance when scanning stdout or Cloud Logging.
const SCOPE_EMOJI = '🌿';

/**
 * Emit a single-line, structured log entry.
 *
 * Cloud Logging parses a single-line JSON object written to stdout into a
 * searchable `jsonPayload`, and reads the special `severity` and `message`
 * fields. Keeping each entry on one line means one log entry per call, which
 * avoids the multi-line noise of pretty-printed JSON.
 *
 * @param {string} severity - a Cloud Logging severity (INFO, WARNING, ERROR)
 * @param {string} message - a short, human-readable summary
 * @param {object} [data] - additional structured fields to attach
 */
function log(severity, message, data = {}) {
  process.stdout.write(`${JSON.stringify({ severity, message, ...data })}\n`);
}

/**
 * Prefix a message with the scope label, e.g. "🌿 [bank-otp] Forwarded OTP".
 * When no scope is given the message is returned untouched.
 *
 * @param {string} [scope]
 * @param {string} message
 * @returns {string}
 */
function withScope(scope, message) {
  return scope ? `${SCOPE_EMOJI} [${scope}] ${message}` : message;
}

/**
 * Build a logger bound to a scope. Every message it emits is prefixed with the
 * leaf emoji and the scope label, so callers just pass their normal message.
 *
 * Pass the app name (typically the folder name, which matches its mount path)
 * as the scope, e.g. `createLogger('bank-otp')`.
 *
 * @param {string} [scope] - omit for an unscoped, prefix-free logger
 * @returns {{ info: Function, warn: Function, error: Function }}
 */
function createLogger(scope) {
  return {
    info: (message, data) => log('INFO', withScope(scope, message), data),
    warn: (message, data) => log('WARNING', withScope(scope, message), data),
    error: (message, data) => log('ERROR', withScope(scope, message), data),
  };
}

// Default, unscoped logger for app-level code (e.g. app.js) that is not tied to
// a single CloudMailin app.
const logger = createLogger();

export default logger;
export { createLogger };
