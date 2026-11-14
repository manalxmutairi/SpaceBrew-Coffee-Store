import { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const apiPath = (path: string) => `${import.meta.env.BASE_URL}api/payments/${path}`;

async function authenticatedRequest(path: string, options: RequestInit = {}) {
  if (!supabase) throw new Error('Customer sign-in is not configured on this website yet.');
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error('Please sign in before continuing.');
  const response = await fetch(apiPath(path), {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}`, ...options.headers },
  });
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Test checkout is not configured on this host yet. Your bag is safe.');
  }
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Payment service is unavailable. Please try again.');
  return body;
}

export function CheckoutButton({ cart, user, onSignIn }: {
  cart: Record<string, number>; user: User | null; onSignIn: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [available, setAvailable] = useState<boolean | null>(null);
  const request = useRef<{ cart: string; id: string } | null>(null);
  useEffect(() => {
    let active = true;
    void fetch(apiPath('config')).then(async (response) => {
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return false;
      return (await response.json()).configured === true;
    }).then((configured) => { if (active) setAvailable(configured); })
      .catch(() => { if (active) setAvailable(false); });
    return () => { active = false; };
  }, []);
  const startCheckout = async () => {
    if (!user) { onSignIn(); return; }
    setBusy(true);
    setError('');
    try {
      const items = Object.entries(cart).filter(([, quantity]) => quantity > 0).map(([id, quantity]) => ({ id, quantity }));
      const key = JSON.stringify(items);
      if (request.current?.cart !== key) request.current = { cart: key, id: crypto.randomUUID() };
      const result = await authenticatedRequest('checkout', {
        method: 'POST',
        body: JSON.stringify({ items, requestId: request.current.id }),
      });
      const url = new URL(result.url);
      if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com') throw new Error('Unexpected payment redirect. Please try again.');
      localStorage.setItem(`cosmic-checkout-${result.sessionId}`, JSON.stringify(cart));
      window.location.assign(url.href);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Checkout could not start. Your bag is safe.');
    } finally { setBusy(false); }
  };
  return <div className="checkout-controls">
    <p className="cart-note">Stripe test checkout · no real payments.<br />Eligible first orders receive 10% off at checkout. Kuwait delivery addresses only; no delivery fee is added in this test.</p>
    <button className="account-submit" type="button" disabled={busy || available !== true} onClick={startCheckout} data-testid="button-checkout">
      {available === null ? 'Checking checkout availability…' : available === false ? 'Test checkout setup pending' : busy ? 'Opening secure checkout…' : user ? 'Continue to test checkout' : 'Sign in to checkout'}
    </button>
    {available === false && <p className="cart-note" role="status">Payments are not enabled on this host yet. You can keep browsing and your bag will be saved.</p>}
    {error && <p className="account-error" role="alert">{error}</p>}
  </div>;
}

export function PaymentReturn({ user, onSignIn, onPaid }: {
  user: User | null; onSignIn: () => void; onPaid: (sessionId: string) => void;
}) {
  const [result, setResult] = useState(() => typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('checkout'));
  const [message, setMessage] = useState('');
  const [paid, setPaid] = useState(false);
  const [retry, setRetry] = useState(0);
  const complete = useRef(onPaid);
  complete.current = onPaid;
  useEffect(() => {
    if (result !== 'success' || !user) return;
    let active = true;
    const id = new URLSearchParams(window.location.search).get('session_id');
    if (!id) { setMessage('The payment reference is missing. Your bag has not been cleared.'); return; }
    setMessage('Checking your test payment securely…');
    void authenticatedRequest(`status?session_id=${encodeURIComponent(id)}`).then((body) => {
      if (!active) return;
      if (body.paid) {
        setPaid(true);
        setMessage('Your test payment was confirmed. No real money was charged.');
        complete.current(id);
      } else {
        setMessage('Payment is not confirmed yet. Your bag has been kept. You can check again below.');
      }
    }).catch((error) => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, [result, user, retry]);
  if (!result) return null;
  return <section className="payment-return" role="status" data-testid="payment-return">
    <strong>{result === 'cancelled' ? 'Checkout cancelled' : paid ? 'Thank you for your test order' : 'Payment confirmation'}</strong>
    <p>{result === 'cancelled' ? 'No payment was completed here. Your bag is still saved.' : !user ? 'Sign in to securely confirm this payment.' : message}</p>
    {result === 'success' && !user && <button type="button" onClick={onSignIn}>Sign in</button>}
    {result === 'success' && user && !paid && <button type="button" onClick={() => setRetry((value) => value + 1)}>Check payment again</button>}
    <button type="button" onClick={() => { window.history.replaceState({}, '', window.location.pathname); setResult(null); }}>Dismiss</button>
  </section>;
}

export function CustomerOrders() {
  const [orders, setOrders] = useState<{id: string; created_at: string; payment_status: string | null; amount_total: string | null; currency: string | null}[]>([]);
  const [message, setMessage] = useState('Loading your orders…');
  useEffect(() => {
    let active = true;
    void authenticatedRequest('orders').then((data) => {
      if (!active) return;
      setOrders(data.orders);
      setMessage(data.orders.length ? '' : 'No test orders yet.');
    }).catch((error) => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, []);
  return <section className="customer-orders"><h3>Your test orders</h3>
    {message && <p role="status">{message}</p>}
    {orders.map((order) => <div className="customer-order" key={order.id}>
      <span>{new Date(order.created_at).toLocaleDateString()} · {order.payment_status === 'paid' ? 'Paid' : 'Awaiting confirmation'}</span>
      {order.amount_total !== null && <strong>{order.currency?.toUpperCase()} {(Number(order.amount_total) / 1000).toFixed(3)}</strong>}
    </div>)}
  </section>;
}
