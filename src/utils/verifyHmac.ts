import crypto from 'crypto';

export function verifyHmac(query: any, secret: string): boolean {
  // Paymob HMAC calculation requires specific fields in exact order
  const keys = [
    'amount_cents',
    'created_at',
    'currency',
    'error_occured',
    'has_parent_transaction',
    'id',
    'integration_id',
    'is_3d_secure',
    'is_auth',
    'is_capture',
    'is_refunded',
    'is_standalone_payment',
    'is_voided',
    'order',
    'owner',
    'pending',
    'source_data.pan',
    'source_data.sub_type',
    'source_data.type',
    'success'
  ];

  let concatenatedString = '';
  for (const key of keys) {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      if (query[parent] && query[parent][child] !== undefined) {
        concatenatedString += query[parent][child];
      }
    } else {
      if (query[key] !== undefined) {
        concatenatedString += query[key];
      }
    }
  }

  const hmac = crypto.createHmac('sha512', secret);
  hmac.update(concatenatedString);
  const calculatedHmac = hmac.digest('hex');

  return calculatedHmac === query.hmac;
}
