// utilities/logger.js

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

const logger = {
  info: (message, data) => log('INFO', message, data),
  warn: (message, data) => log('WARNING', message, data),
  error: (message, data) => log('ERROR', message, data),
};

export default logger;
