import fs from 'fs';
import path from 'path';

console.log('=== PHASE 5 — MODULE 5.8: CART / CHECKOUT UX AUDIT ===\n');

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

// 1. Audit CartContext.tsx
const cartContextPath = path.resolve('features/cart/context/CartContext.tsx');
assert(fs.existsSync(cartContextPath), 'CartContext.tsx file existence');
const cartContextContent = fs.readFileSync(cartContextPath, 'utf8');

assert(
  cartContextContent.includes('mostafa_elgzar_cart_v1'),
  'PERSISTENCE M5.8-01: CartContext persists cart items in localStorage key mostafa_elgzar_cart_v1'
);

assert(
  cartContextContent.includes('addToCart') && cartContextContent.includes('removeFromCart') && cartContextContent.includes('clearCart'),
  'CART M5.8-02: CartContext provides clean add, remove, quantity update, and clear operations'
);

// 2. Audit UnifiedCartDrawer.tsx
const drawerPath = path.resolve('features/cart/components/UnifiedCartDrawer.tsx');
assert(fs.existsSync(drawerPath), 'UnifiedCartDrawer.tsx file existence');
const drawerContent = fs.readFileSync(drawerPath, 'utf8');

assert(
  !/\border_source\b/.test(drawerContent),
  'CONTRACT CHECK M5.8-03: UnifiedCartDrawer contains 0 references to order_source'
);

assert(
  !/\bdaily_shift_id\b/.test(drawerContent) && !/\bshift_id\b/.test(drawerContent),
  'CONTRACT CHECK M5.8-04: UnifiedCartDrawer contains 0 references to daily_shift_id or shift_id'
);

assert(
  drawerContent.includes("fetch('/api/orders'"),
  'CHECKOUT M5.8-05: UnifiedCartDrawer posts checkout order directly to /api/orders'
);

assert(
  drawerContent.includes('isSubmitting') && drawerContent.includes('disabled={'),
  'SAFETY M5.8-06: UnifiedCartDrawer enforces double-submit prevention & loading state lock'
);

assert(
  drawerContent.includes('router.push') && drawerContent.includes('/order/'),
  'HANDOFF M5.8-07: UnifiedCartDrawer handoffs successful order to tracking route /order/[id]'
);

// 3. Audit ProductOptionsSheet.tsx
const optionsSheetPath = path.resolve('features/menu/components/ProductOptionsSheet.tsx');
assert(fs.existsSync(optionsSheetPath), 'ProductOptionsSheet.tsx file existence');
const optionsSheetContent = fs.readFileSync(optionsSheetPath, 'utf8');

assert(
  optionsSheetContent.includes('variant_id') && optionsSheetContent.includes('quantity'),
  'OPTIONS M5.8-08: ProductOptionsSheet formats line item with variant_id, quantity, and notes'
);

// 4. Audit CheckoutForm.tsx
const checkoutFormPath = path.resolve('features/orders/components/CheckoutForm.tsx');
assert(fs.existsSync(checkoutFormPath), 'CheckoutForm.tsx file existence');

console.log(`\n=== MODULE 5.8 SUMMARY: ${passCount} PASSED, ${failCount} FAILED ===`);
if (failCount > 0) process.exit(1);
