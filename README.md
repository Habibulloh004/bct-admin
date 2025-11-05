This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

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

## Product CRUD helpers

Reusable multilingual product helpers live in `src/lib/productCrud.js`. Import `useProductCrud` inside client components to call `addProduct`, `updateProduct`, and `deleteProduct`, or reuse `buildProductPayload` when you need a pre-formatted payload:

```js
import { useProductCrud } from "@/lib/productCrud";

const { addProduct, updateProduct, deleteProduct, buildProductPayload } = useProductCrud();
```

Each helper normalises English, Russian, and Uzbek fields into the `***`-delimited strings used throughout the admin panel and keeps the dynamic table description serialised in the format expected by the API.

## Unified API actions

Server-side API helpers in `src/actions/api.js` expose a single `apiRequest` wrapper (with `getApi`, `postApi`, `putApi`, and `deleteApi` aliases) that call your backend without CORS issues:

```js
import { getApi, postApi, deleteApi } from "@/actions/api";

const { data } = await getApi("products", { token, params: { page: 1 } });
await postApi("admin/login", { name, password });
await deleteApi(`products/${id}`, { token });
```

These helpers run as Next.js server actions and support JSON bodies, query params, bearer auth, custom headers, and cache hints (`next`/`revalidate`). They are reused inside the Zustand store so every CRUD call (including login) now flows through the same entry point.
