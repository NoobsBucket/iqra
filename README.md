# Next.js Framework Starter

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/next-starter-template)

<!-- dash-content-start -->

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). It's deployed on Cloudflare Workers as a [static website](https://developers.cloudflare.com/workers/static-assets/).

This template uses [OpenNext](https://opennext.js.org/) via the [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare), which works by taking the Next.js build output and transforming it, so that it can run in Cloudflare Workers.

<!-- dash-content-end -->

Outside of this repo, you can start a new project with this template using [C3](https://developers.cloudflare.com/pages/get-started/c3/) (the `create-cloudflare` CLI):

```bash
npm create cloudflare@latest -- --template=cloudflare/templates/next-starter-template
```

A live public deployment of this template is available at [https://next-starter-template.templates.workers.dev](https://next-starter-template.templates.workers.dev)

## Getting Started

First, run:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then run the development server (using the package manager of your choice):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Deploying To Production

| Command              | Action                                                    |
| :------------------- | :-------------------------------------------------------- |
| `npm run build`      | Build the Next.js app and Cloudflare Worker assets        |
| `npm run preview`    | Build and preview the Worker locally before deploying    |
| `npm run deploy`     | Build and deploy your production site to Cloudflare       |
| `npx wrangler tail`  | View real-time logs for all Workers                       |

## Admin Media Uploads

Course, lesson, category, blog, and site media are uploaded directly from the admin panel to Cloudflare R2. The app signs each upload on the server; the R2 access key and secret must never use a `NEXT_PUBLIC_` prefix.

Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `R2_PUBLIC_URL` in `.env.local` for local development. Successful backend-confirmed admin logins receive a seven-day HttpOnly session used by the upload signer. `JWT_SECRET` is an optional signing-key override; when omitted, the app derives a separate session key from `R2_SECRET_ACCESS_KEY`. In Cloudflare, add the R2 values as Worker secrets or variables (use `wrangler secret put` for credentials). `R2_PUBLIC_URL` must be the bucket's public custom domain, without a trailing slash. Sign in again after deploying this change to receive the new admin session. The R2 token needs object read/write access for the target bucket.

Configure the bucket's CORS policy to allow `PUT` from the site's exact origin, with `Content-Type` as an allowed request header and `ETag` as an exposed response header. Supported uploads are images up to 20 MB and videos up to 5 GB. Public reads are served from the configured R2 custom domain.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
