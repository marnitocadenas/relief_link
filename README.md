# ReliefLink

ReliefLink is a Laravel API and React SPA for campus donations, verified requests, and administrator-managed matching.

## Setup

1. Update `.env` with a MySQL database and working credentials. The database named by `DB_DATABASE` must exist.
2. Run `php artisan migrate:fresh --seed`.
3. Run `npm install` and `npm run dev` (or `npm run build`).
4. Run `php artisan serve` and visit the displayed URL.

The SPA uses Sanctum personal-access tokens. Tokens are sent as Bearer tokens through the single Axios client, so the frontend and API can be deployed separately by setting `VITE_API_BASE_URL` to the API's `/api` URL. Client-side role routing is only an experience feature; every protected API endpoint also enforces `auth:sanctum` and role middleware/policies.

Seeded administrator: `admin@relieflink.test` / `password`.

## Main endpoints

- `POST /api/register`, `POST /api/login`, `POST /api/logout`, `GET /api/user`
- Donations and requests: `/api/donations`, `/api/requests`
- Matches and notifications: `/api/matches`, `/api/notifications`
- Administrator functions: `/api/admin/*`

Matching ranks approved requests by urgency and then oldest submission, supports quantity splitting, and records proposed matches transactionally. An admin must confirm each proposal.
