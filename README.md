## TireScan AI

Snap a tire sidewall → AI decodes specs & condition → See nearby shop inventory.

### Stack
* Next.js App Router
* Tailwind v4
* OpenAI Vision (GPT-4o family)

### Quick Start
1. Install deps
2. Add `OPENAI_API_KEY` to an `.env.local` file
3. Run dev server

### Env
```
OPENAI_API_KEY=sk-...
```

### Run
```
npm install
npm run dev
```

### Roadmap
- Geolocation & real distance sorting
- Persistent database (Postgres / Neon)
- Auth for shops (magic links)
- Tire code OCR fine-tuning
- Condition estimation via vision model scoring tread depth (future ML)

---
Generated scaffold. Iterate & harden for production before launch.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
