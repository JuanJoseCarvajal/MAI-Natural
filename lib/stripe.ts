export const stripeConfig = {
  publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  secretKey: process.env.STRIPE_SECRET_KEY ?? ""
};
