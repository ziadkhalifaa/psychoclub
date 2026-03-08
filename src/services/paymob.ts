export async function paymobAuthToken(apiKey: string): Promise<string> {
  const res = await fetch('https://accept.paymob.com/api/auth/tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('Paymob Auth Error:', err);
    throw new Error('PAYMENT_INIT_FAILED');
  }
  const data = await res.json();
  return data.token;
}

export async function createOrder(
  token: string,
  amountCents: number,
  merchantOrderId: string,
  items: any[] = []
): Promise<number> {
  const res = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: token,
      delivery_needed: 'false',
      amount_cents: amountCents.toString(),
      currency: 'EGP',
      merchant_order_id: merchantOrderId,
      items: items,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('Paymob Order Error:', err);
    throw new Error('PAYMENT_ORDER_FAILED');
  }
  const data = await res.json();
  return data.id;
}

export async function generatePaymentKey(
  token: string,
  orderId: number,
  amountCents: number,
  billingData: any,
  integrationId: string
): Promise<string> {
  const res = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: token,
      amount_cents: amountCents.toString(),
      expiration: 3600,
      order_id: orderId.toString(),
      billing_data: billingData,
      currency: 'EGP',
      integration_id: integrationId,
      lock_order_when_paid: 'false',
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('Paymob Payment Key Error:', err);
    throw new Error('PAYMENT_KEY_FAILED');
  }
  const data = await res.json();
  return data.token;
}

export function buildPaymentUrl(paymentKey: string, iframeId?: string): string {
  if (iframeId) {
    return `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;
  }
  return `https://accept.paymob.com/api/acceptance/iframes/0?payment_token=${paymentKey}`;
}
