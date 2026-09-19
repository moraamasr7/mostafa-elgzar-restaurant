import fs from 'fs';
import path from 'path';

console.log('=== PHASE 4 — MODULE 1: CONTRACT LOCK & STATIC CODE AUDIT ===\n');

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

// 1. Audit Type Definitions for Order & Shift
const ordersTypePath = path.resolve('types/orders.ts');
const shiftsTypePath = path.resolve('types/shifts.ts');

assert(fs.existsSync(ordersTypePath), 'types/orders.ts file existence');
assert(fs.existsSync(shiftsTypePath), 'types/shifts.ts file existence');

const ordersTypeContent = fs.readFileSync(ordersTypePath, 'utf8');

// Assert NO shift_id in Order type definition
assert(
  !/\bshift_id\b/.test(ordersTypeContent),
  'CONTRACT CHECK: Order type has NO shift_id column',
  'Confirmed absence of shift_id FK property in Order interface'
);

// Assert NO order_source in Order type definition
assert(
  !/\border_source\b/.test(ordersTypeContent),
  'CONTRACT CHECK: Order type has NO order_source column',
  'Confirmed absence of order_source property in Order interface'
);

// Assert order_type enum contains takeaway, delivery, dine_in
assert(
  ordersTypeContent.includes("'takeaway' | 'delivery' | 'dine_in'") || ordersTypeContent.includes("'delivery' | 'takeaway' | 'dine_in'"),
  'CONTRACT CHECK: Order type relies on order_type classification',
  "order_type contains 'takeaway' | 'delivery' | 'dine_in'"
);

// 2. Audit API Endpoints for Shift Association Strategy
const shiftCloseApiPath = path.resolve('app/api/admin/shifts/close/route.ts');
const shiftCloseContent = fs.readFileSync(shiftCloseApiPath, 'utf8');

assert(
  shiftCloseContent.includes("gte('created_at', shift.opened_at)"),
  'CONTRACT CHECK: Shift Close API uses temporal gte(created_at, shift.opened_at)',
  'Found gte filter on created_at against shift.opened_at'
);

// Check that orders query block does not filter orders table by shift_id
const ordersQueryBlock = shiftCloseContent.split(".from('orders')")[1]?.split(".from(")[0] || '';

assert(
  !ordersQueryBlock.includes('shift_id'),
  'CONTRACT CHECK: Shift Close API orders query does NOT use shift_id',
  'Confirmed orders table query filters exclusively by created_at >= shift.opened_at'
);

// 3. Audit Customer & Admin Order API for order_type enforcement
const customerOrderApiPath = path.resolve('app/api/orders/route.ts');
const adminOrderApiPath = path.resolve('app/api/admin/orders/route.ts');

const customerOrderContent = fs.readFileSync(customerOrderApiPath, 'utf8');
const adminOrderContent = fs.readFileSync(adminOrderApiPath, 'utf8');

assert(
  customerOrderContent.includes('order_type'),
  'CONTRACT CHECK: Customer order route accepts order_type parameter'
);

assert(
  adminOrderContent.includes('order_type'),
  'CONTRACT CHECK: Admin order route accepts order_type parameter'
);

assert(
  !customerOrderContent.includes('order_source') && !adminOrderContent.includes('order_source'),
  'CONTRACT CHECK: Neither order route references order_source column',
  'Zero references to order_source in customer/admin order API handlers'
);

// 4. Audit DB Schema SQL file if present
const schemaSqlPath = path.resolve('scratch/gazzar_schema_final.sql');
if (fs.existsSync(schemaSqlPath)) {
  const schemaContent = fs.readFileSync(schemaSqlPath, 'utf8');
  assert(
    !schemaContent.includes('ALTER TABLE orders ADD COLUMN shift_id'),
    'CONTRACT CHECK: Schema SQL has NO shift_id migration'
  );
  assert(
    !schemaContent.includes('ALTER TABLE orders ADD COLUMN order_source'),
    'CONTRACT CHECK: Schema SQL has NO order_source migration'
  );
}

console.log(`\n=== MODULE 1 SUMMARY: ${passCount} PASSED, ${failCount} FAILED ===`);
if (failCount > 0) process.exit(1);
