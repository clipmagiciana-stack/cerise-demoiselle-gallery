# Cerise Demoiselle Studio storefront

Public catalogue: https://cerise-demoiselle-studio.rich-trout-3520.chatgpt.site
Separate administrator page: https://cerise-demoiselle-studio.rich-trout-3520.chatgpt.site/admin.html

Responsive product catalogue with stock availability, persisted cart and WhatsApp enquiries. Administration supports products, photos, pricing and stock. Data lives in Cloudflare D1; uploaded images live in R2.

## Administration

The server validates credentials with PBKDF2-SHA256 and creates an eight-hour, random session. Session cookies are Secure, HttpOnly and SameSite=Strict. Mutating endpoints require a matching Origin and an authenticated session. Login attempts are limited per IP and 15-minute window.

Set these production secrets through Sites runtime configuration:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_SALT`
- `ADMIN_PASSWORD_HASH` (PBKDF2-SHA256, 100000 iterations, 32-byte output, hexadecimal)

Credentials and session tokens must never be committed. Configure a new salt and hash to change the password. Existing sessions expire after eight hours.

## Development and validation

Install dependencies with the included install scripts. Run `node scripts/check-storefront.mjs` for cart, inventory, escaping and recovery regression checks; `node node_modules/typescript/bin/tsc --noEmit` for type checking; and `npm run build` for the production build.

Deploy through the Sites source workflow, preserving `.openai/hosting.json` and its project identity. GitHub Pages alone cannot run the server-side admin or database API.

## Verification

Production HTTP checks verified the catalogue, anonymous denial, wrong/right login, cookie flags, session validation, cross-origin rejection, invalid payload rejection and logout without modifying products. Cart regression checks passed. Visual browser QA, Lighthouse measurements and concurrency/load tests have not been completed.
