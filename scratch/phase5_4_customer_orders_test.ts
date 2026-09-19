import fs from 'fs';
import path from 'path';

console.log('=== PHASE 5 — MODULE 5.4: CUSTOMER ORDERS & TRACKING UI AUDIT ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    if (detail) console.log(`       Evidence: ${detail}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName}`);
    if (detail) console.error(`       Detail: ${detail}`);
    failCount++;
  }
}

// 1. Audit CheckoutForm.tsx
const checkoutFormPath = path.resolve('features/orders/components/CheckoutForm.tsx');
assert(fs.existsSync(checkoutFormPath), 'CheckoutForm.tsx file existence');
const checkoutFormContent = fs.readFileSync(checkoutFormPath, 'utf8');

// Assert 1: Absence of order_source
assert(
  !/\border_source\b/.test(checkoutFormContent),
  'CONTRACT CHECK M5.4-01: CheckoutForm contains 0 references to order_source',
  'Confirmed absence of order_source in customer checkout UI'
);

// Assert 2: Absence of daily_shift_id
assert(
  !/\bdaily_shift_id\b/.test(checkoutFormContent) && !/\bshift_id\b/.test(checkoutFormContent),
  'CONTRACT CHECK M5.4-02: CheckoutForm contains 0 references to daily_shift_id or shift_id',
  'Confirmed absence of shift_id in customer checkout UI'
);

// Assert 3: Order Type classification
assert(
  checkoutFormContent.includes("orderType === 'delivery'") && checkoutFormContent.includes("orderType === 'takeaway'"),
  'CONTRACT CHECK M5.4-03: CheckoutForm strictly uses order_type classification (delivery | takeaway)',
  'Confirmed order_type usage'
);

// Assert 4: API Endpoint call to /api/orders
assert(
  checkoutFormContent.includes("fetch('/api/orders'"),
  'CONTRACT CHECK M5.4-04: CheckoutForm posts orders to /api/orders API handler',
  'Confirmed API endpoint wire-up'
);

// Assert 5: Double submission guard lock
assert(
  checkoutFormContent.includes('isSubmitting') && checkoutFormContent.includes('disabled={!isFormValid || isSubmitting}'),
  'SAFETY M5.4-05: CheckoutForm enforces double-submit prevention & loading state lock',
  'Confirmed isSubmitting lock on submit button'
);

// Assert 6: Turnstile Captcha Integration
assert(
  checkoutFormContent.includes('Turnstile') && checkoutFormContent.includes('turnstile_token'),
  'SECURITY M5.4-06: CheckoutForm requires Turnstile captcha verification',
  'Confirmed turnstile_token payload field'
);

// 2. Audit Customer API Handler app/api/orders/route.ts
const customerApiPath = path.resolve('app/api/orders/route.ts');
assert(fs.existsSync(customerApiPath), 'app/api/orders/route.ts file existence');
const customerApiContent = fs.readFileSync(customerApiPath, 'utf8');

assert(
  customerApiContent.includes('create_order_secure'),
  'CONTRACT CHECK M5.4-07: Customer API handler delegates order insertion to create_order_secure RPC',
  'Confirmed create_order_secure RPC invocation'
);

assert(
  !customerApiContent.includes('order_source') && !customerApiContent.includes('daily_shift_id'),
  'CONTRACT CHECK M5.4-08: Customer API handler has 0 references to order_source or daily_shift_id',
  'Clean API handler contract'
);

// 3. Audit Tracking View & Hook
const trackingViewPath = path.resolve('features/tracking/components/OrderTrackingView.tsx');
const trackingHookPath = path.resolve('features/tracking/hooks/useOrderRealtime.ts');

assert(fs.existsSync(trackingViewPath), 'OrderTrackingView.tsx file existence');
assert(fs.existsSync(trackingHookPath), 'useOrderRealtime.ts file existence');

const trackingHookContent = fs.readFileSync(trackingHookPath, 'utf8');

assert(
  trackingHookContent.includes('get_customer_order_tracking'),
  'SECURITY M5.4-09: Customer Tracking Hook uses secure get_customer_order_tracking RPC with tracking_token',
  'Confirmed RPC invocation with tracking_token parameter'
);

console.log(`\n=== MODULE 5.4 SUMMARY: ${passCount} PASSED, ${failCount} FAILED ===`);
if (failCount > 0) process.exit(1);
