# Merchant Center Compliance Checker — Vercel + Neon + OpenAI

Now upgraded for:
- Vercel deployment
- Neon SQL user/auth/credits/history
- Server-side OpenAI calls (API key protected)

## 1) Setup Neon database
- Create a Neon project + database
- Copy pooled connection string (`postgresql://...`)
- Add it in Vercel as `DATABASE_URL`

## 2) Required env vars
In Vercel Project → Settings → Environment Variables:
- `OPENAI_API_KEY`
- `JWT_SECRET`
- `DATABASE_URL`

## 3) Initialize SQL
Run `db/schema.sql` in Neon SQL Editor once.

## 4) Deploy
```bash
npm install
vercel --prod
```

## 5) Local dev
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

## Notes
- Each analysis decrements `searches_remaining`.
- Analysis results are stored in `analyses` table.
- Frontend keeps only JWT token + current user snapshot.
