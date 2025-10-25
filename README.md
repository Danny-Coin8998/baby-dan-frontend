This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Setup

Before running the application, you need to set up the following environment variables in your `.env.local` file:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Blockchain Configuration for Withdrawals
NEXT_PUBLIC_PAYMENT_WALLET_PRIVATE_KEY=your_payment_wallet_private_key_here
NEXT_PUBLIC_DAN_TOKEN_ADDRESS=your_dan_token_contract_address_here
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org/
```

**Important Notes:**
- `NEXT_PUBLIC_PAYMENT_WALLET_PRIVATE_KEY`: The private key of the wallet that holds DAN tokens for withdrawals
- `NEXT_PUBLIC_DAN_TOKEN_ADDRESS`: The contract address of the DAN token on Binance Smart Chain
- `NEXT_PUBLIC_BSC_RPC_URL`: RPC endpoint for Binance Smart Chain (default provided)

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
