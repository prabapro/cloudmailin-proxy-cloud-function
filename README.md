# cloudmailin-proxy

Google Cloud Run Function (Gen 2) that receives [CloudMailin](https://www.cloudmailin.com/) webhooks and routes them to path-scoped apps. Each app lives in its own folder under `apps/` and owns its parsers, notifications, and config.

## Structure

```
index.js                        Entry point: loads env, registers the Express app
app.js                          Express app: mounts one router per app, health check, 404
logger.js                       Shared structured logger (single-line JSON for Cloud Logging)
config.js? (removed)            Config now lives per app under apps/<app>/config.js

apps/
  bank-otp/
    index.js                    Express router (POST /bank-otp)
    handler.js                  Request handling + orchestration
    config.js                   App config (BANK_OTP_ env prefix)
    parsers/                    Per-bank OTP extraction
      index.js
      combank.js
      hnb.js
      ntb.js
    notifications/
      slack.js                  Posts the OTP to Slack as a Block Kit card
    sample-data/                Example webhook payloads
```

### Adding a new app

1. Create `apps/<app-name>/` with its own `index.js` exporting an Express router.
2. Mount it in `app.js`: `app.use('/<app-name>', <appRouter>);`
3. Namespace its env vars with an uppercase prefix (e.g. `AQUAFINA_INVOICE_...`).

## Endpoints

| Method | Path        | Purpose                |
| ------ | ----------- | ---------------------- |
| GET    | `/health`   | Liveness probe         |
| POST   | `/bank-otp` | Bank OTP email webhook |

## Environment variables

| Variable                     | Used by  | Description                |
| ---------------------------- | -------- | -------------------------- |
| `BANK_OTP_SLACK_WEBHOOK_URL` | bank-otp | Slack incoming webhook URL |

Set these in a local `.env` file. The deploy script converts `.env` to `.env.yaml` via `npm run create-env-yaml`.

## GCP permissions

Requires both `Editor` and `Cloud Run Admin`.

## Commands

### Start dev server (nodemon)

```sh
npm run dev
```

### Deploy function

```sh
npm run deploy
```
