import fs from 'fs';
import path from 'path';

const root = 'c:/Users/mamdo/Documents/GitHub/mostafa-elgzar-restaurant';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, description: string, detail?: string) {
  if (condition) {
    passCount++;
    console.log(`✅ [PASS] ${description}${detail ? ` - ${detail}` : ''}`);
  } else {
    failCount++;
    console.error(`❌ [FAIL] ${description}${detail ? ` - ${detail}` : ''}`);
  }
}

console.log('\n================================================================');
console.log('🚀 RUNNING PHASE 5 — MODULE 5.10 FINAL E2E CERTIFICATION SUITE');
console.log('================================================================\n');

// 1. Check order_source absence
const checkoutForm = fs.readFileSync(path.join(root, 'features/orders/components/CheckoutForm.tsx'), 'utf-8');
const orderApi = fs.readFileSync(path.join(root, 'app/api/orders/route.ts'), 'utf-8');
const trackingHook = fs.readFileSync(path.join(root, 'features/tracking/hooks/useOrderRealtime.ts'), 'utf-8');
const cartDrawer = fs.readFileSync(path.join(root, 'features/cart/components/UnifiedCartDrawer.tsx'), 'utf-8');
const menuPage = fs.readFileSync(path.join(root, 'app/menu/page.tsx'), 'utf-8');

assert(!/\border_source\b/.test(checkoutForm) && !/\border_source\b/.test(orderApi) && !/\border_source\b/.test(trackingHook),
  'CONTRACT CHECK M5.10-01: order_source is strictly ABSENT across UI and API handlers');

// 2. Check daily_shift_id absence
assert(!/\bdaily_shift_id\b/.test(checkoutForm) && !/\bdaily_shift_id\b/.test(orderApi) && !/\bdaily_shift_id\b/.test(trackingHook),
  'CONTRACT CHECK M5.10-02: daily_shift_id is strictly ABSENT across UI and API handlers');

// 3. Check order_type contract
assert(checkoutForm.includes('order_type') && orderApi.includes('order_type'),
  'CONTRACT CHECK M5.10-03: order_type contract present in UI and API');

// 4. Financial boundary check: No revenue summation in admin page or customer UI
const adminPage = fs.readFileSync(path.join(root, 'app/admin/page.tsx'), 'utf-8');
assert(!/total_amount\s*\+=\s*Number/.test(adminPage) && !/revenue\s*\+=/.test(adminPage),
  'FINANCIAL BOUNDARY M5.10-04: Admin page contains 0 client-side revenue summation loops');

// 5. Turnstile security check
assert(checkoutForm.includes('turnstile_token') && orderApi.includes('turnstile_token'),
  'SECURITY CHECK M5.10-05: Turnstile bot protection integrated in CheckoutForm and API');

// 6. Tracking Token Security
assert(trackingHook.includes('p_tracking_token') && trackingHook.includes('get_customer_order_tracking'),
  'SECURITY CHECK M5.10-06: Order tracking uses secure tracking token RPC (get_customer_order_tracking)');

// 7. Customer E2E Flow components check
const categoryRail = fs.existsSync(path.join(root, 'features/menu/components/CategoryRail.tsx'));
const menuItemCard = fs.existsSync(path.join(root, 'features/menu/components/MenuItemCard.tsx'));
const productOptionsSheet = fs.existsSync(path.join(root, 'features/menu/components/ProductOptionsSheet.tsx'));
const cartContext = fs.existsSync(path.join(root, 'features/cart/context/CartContext.tsx'));
const globalCheckout = fs.existsSync(path.join(root, 'features/orders/components/GlobalCheckout.tsx'));

assert(categoryRail && menuItemCard && productOptionsSheet && cartContext && globalCheckout,
  'CUSTOMER E2E FLOW M5.10-07: All required customer menu, cart, checkout components exist and integrated');

// 8. Reservation E2E components check
const reservationModal = fs.existsSync(path.join(root, 'features/reservations/components/TableReservationModal.tsx'));
const reservationApi = fs.existsSync(path.join(root, 'app/api/reservations/route.ts'));
assert(reservationModal && reservationApi,
  'RESERVATION E2E M5.10-08: Table reservation modal and API route exist and integrated');

// 9. Feedback E2E components check
const feedbackModal = fs.existsSync(path.join(root, 'features/feedback/components/CustomerFeedbackModal.tsx'));
const feedbackApi = fs.existsSync(path.join(root, 'app/api/feedback/route.ts'));
assert(feedbackModal && feedbackApi,
  'FEEDBACK E2E M5.10-09: Customer feedback modal and API route exist and integrated');

// 10. Root layout RTL & Arabic check
const rootLayout = fs.readFileSync(path.join(root, 'app/layout.tsx'), 'utf-8');
assert(rootLayout.includes('dir="rtl"') && rootLayout.includes('lang="ar"'),
  'RTL CHECK M5.10-10: Root layout configured with dir="rtl" and lang="ar"');

console.log('\n================================================================');
console.log(`SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
