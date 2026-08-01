# cloudmailin-proxy

Google Cloud Run Function (Gen 2) that receives [CloudMailin](https://www.cloudmailin.com/) webhooks and routes them to path-scoped apps. Each app lives in its own folder under `apps/` and owns its parsers, notifications, and config.

### Adding a new app

1. Create `apps/<app-name>/` with its own `index.js` exporting an Express router.
2. Mount it in `app.js`: `app.use('/<app-name>', <appRouter>);`
3. Namespace its env vars with an uppercase prefix (e.g. `AQUAFINA_INVOICE_...`).

## Endpoints

| Method | Path                | Purpose                        |
| ------ | ------------------- | ------------------------------ |
| GET    | `/health`           | Liveness probe                 |
| POST   | `/bank-otp`         | Bank OTP email webhook         |
| POST   | `/aquafina-invoice` | Aquafina invoice email webhook |

## Environment variables

Set these in a local `.env` file. The deploy script converts `.env` to `.env.yaml` via `pnpm create-env-yaml`.

## GCP permissions

Requires both `Editor` and `Cloud Run Admin`.

## Commands

### Start dev server (nodemon)

```sh
pnpm dev
```

### Deploy function

```sh
pnpm deploy
```
