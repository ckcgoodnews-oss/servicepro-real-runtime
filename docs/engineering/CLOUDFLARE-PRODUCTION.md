# Cloudflare Production Frontend

The current frontend is a Next.js static export deployed through Workers Static Assets:

- build: `npm --prefix apps/web run build:pages`
- output: `apps/web/out`
- config: `apps/web/wrangler.toml`
- canonical hostname: `https://www.aardvark-enterprises.net`

This is not an OpenNext deployment. Server-only Next.js behavior must not be assumed.

## Operator actions

1. Build with `NEXT_PUBLIC_API_BASE_URL=https://api.aardvark-enterprises.net` only after that API hostname is correctly provisioned.
2. Deploy the immutable `out/` artifact and record Worker version/SHA.
3. Attach and verify the `www` custom domain.
4. Configure a permanent HTTPS apex-to-`www` redirect.
5. Add narrow security headers after testing all required resources. At minimum evaluate HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and CSP `frame-ancestors`.
6. Add provider-generated email DNS records without creating duplicate SPF policies.

Verification requires HTTPS/DNS checks, browser authentication/API smoke, no mixed content, correct headers, 404 behavior, and inspection of built assets for localhost/server secrets.
