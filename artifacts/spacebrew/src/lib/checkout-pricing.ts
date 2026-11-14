// Approved fixed shop rate, not a live market exchange rate.
export const USD_PER_KWD = 3.25;
export const CHECKOUT_CURRENCY = 'usd';
export const CHECKOUT_PRICE_VERSION = 'usd_325_test_v1';

// Integer arithmetic: 1000 KWD fils × 3.25 USD/KWD = 325 USD cents.
// Round each unit to a cent before multiplying by quantity, as Stripe does.
export function kwdFilsToUsdCents(fils: number) {
  if (!Number.isSafeInteger(fils) || fils < 0 || fils > Number.MAX_SAFE_INTEGER / 325) {
    throw new Error('Invalid KWD amount.');
  }
  return Math.floor((fils * 325 + 500) / 1000);
}

export function formatStripeAmount(amount: number, currency: string) {
  const code = currency.toLowerCase();
  if (code === 'kwd') return `KWD ${(amount / 1000).toFixed(3)}`;
  if (code === 'usd') return `US$${(amount / 100).toFixed(2)}`;
  return `${currency.toUpperCase()} ${amount} minor units`;
}
