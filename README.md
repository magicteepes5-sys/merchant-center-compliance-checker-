# Merchant Center Compliance Checker — Vercel + SQL Edition

Now upgraded for:
- Vercel deployment
- SQL user/auth/credits/history (Vercel Postgres)
- Server-side Gemini calls (API key protected)

## 1) Setup Vercel Postgres
- In Vercel project: **Storage → Create Database → Postgres**
- Connect it to this project (env vars auto-injected)

## 2) Required env vars
In Vercel Project → Settings → Environment Variables:
- `GEMINI_API_KEY`
- `JWT_SECRET`
- Postgres vars (auto from Vercel Storage)

## 3) Deploy
```bash
npm install
vercel --prod
```

## 4) Local dev
```bash
npm install
npm run dev
```

## API routes
- `POST /api/auth-signup`
- `POST /api/auth-login`
- `GET /api/me`
- `POST /api/analyze-website`
- `POST /api/analyze-feed`

## SQL
Schema file available at `db/schema.sql`.
Tables are also auto-created on first request.

## Notes
- Each analysis decrements `searches_remaining`.
- Analysis results are stored in `analyses` table.
- Frontend keeps only JWT token + current user snapshot.
