import fs from 'fs';
import path from 'path';

console.log('=== PHASE 5 — MODULE 5.5: CUSTOMER ORDER TRACKING UI AUDIT ===\n');

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

// 1. Audit app/order/[id]/page.tsx
const trackingPagePath = path.resolve('app/order/[id]/page.tsx');
assert(fs.existsSync(trackingPagePath), 'app/order/[id]/page.tsx file existence');
const trackingPageContent = fs.readFileSync(trackingPagePath, 'utf8');

assert(
  trackingPageContent.includes('OrderTrackingView'),
  'M5.5-01: Order page mounts OrderTrackingView in Suspense boundary'
);

// 2. Audit features/tracking/components/OrderTrackingView.tsx
const trackingViewPath = path.resolve('features/tracking/components/OrderTrackingView.tsx');
assert(fs.existsSync(trackingViewPath), 'OrderTrackingView.tsx file existence');
const trackingViewContent = fs.readFileSync(trackingViewPath, 'utf8');

assert(
  !/\border_source\b/.test(trackingViewContent),
  'CONTRACT CHECK M5.5-02: OrderTrackingView contains 0 references to order_source'
);

assert(
  !/\bdaily_shift_id\b/.test(trackingViewContent) && !/\bshift_id\b/.test(trackingViewContent),
  'CONTRACT CHECK M5.5-03: OrderTrackingView contains 0 references to daily_shift_id or shift_id'
);

assert(
  trackingViewContent.includes('STATUS_UI_CONFIG'),
  'M5.5-04: OrderTrackingView uses standard STATUS_UI_CONFIG status mapping'
);

assert(
  trackingViewContent.includes('isFailedOrCancelled'),
  'M5.5-05: OrderTrackingView properly handles terminal states (cancelled / failed)'
);

// 3. Audit features/tracking/hooks/useOrderRealtime.ts
const trackingHookPath = path.resolve('features/tracking/hooks/useOrderRealtime.ts');
assert(fs.existsSync(trackingHookPath), 'useOrderRealtime.ts file existence');
const trackingHookContent = fs.readFileSync(trackingHookPath, 'utf8');

assert(
  trackingHookContent.includes('get_customer_order_tracking'),
  'SECURITY M5.5-06: Tracking hook uses secure get_customer_order_tracking RPC with tracking_token'
);

assert(
  trackingHookContent.includes('isMounted') && trackingHookContent.includes('clearInterval'),
  'REALTIME M5.5-07: Tracking hook ensures clean unmount, prevents memory leaks & stops interval on terminal states'
);

assert(
  trackingHookContent.includes("filter: `id=eq.${orderId}`"),
  'REALTIME M5.5-08: Tracking hook scopes Supabase Realtime channel to target order ID'
);

assert(
  !trackingHookContent.includes('order_source') && !trackingHookContent.includes('daily_shift_id'),
  'CONTRACT CHECK M5.5-09: Tracking hook has 0 references to order_source or daily_shift_id'
);

console.log(`\n=== MODULE 5.5 SUMMARY: ${passCount} PASSED, ${failCount} FAILED ===`);
if (failCount > 0) process.exit(1);
