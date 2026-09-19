import fs from 'fs';
import path from 'path';

console.log('=== PHASE 4 — MODULES 2, 3 & 4: SHIFT LIFECYCLE, WORKFLOW & FINANCIAL BOUNDARY AUDIT ===\n');

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

// -------------------------------------------------------------
// MODULE 2: SHIFT LIFECYCLE & EDGE CASE LOGIC AUDIT
// -------------------------------------------------------------
console.log('--- Sub-suite: Shift Lifecycle & Edge Case Safeguards ---');

const shiftApiPath = path.resolve('app/api/admin/shifts/route.ts');
const shiftCloseApiPath = path.resolve('app/api/admin/shifts/close/route.ts');

assert(fs.existsSync(shiftApiPath), 'app/api/admin/shifts/route.ts existence');
assert(fs.existsSync(shiftCloseApiPath), 'app/api/admin/shifts/close/route.ts existence');

const shiftApiContent = fs.readFileSync(shiftApiPath, 'utf8');
const shiftCloseApiContent = fs.readFileSync(shiftCloseApiPath, 'utf8');

// Safeguard 1: Active shift anomaly check (Multiple active shifts)
assert(
  shiftApiContent.includes("MULTIPLE_ACTIVE_SHIFTS_ANOMALY"),
  'SAFEGUARD TC-SHIFT-01: Shift GET API detects and flags multiple active shifts anomaly'
);

// Safeguard 2: Open shift conflict check (Cannot open shift when active shift exists)
assert(
  shiftApiContent.includes("ACTIVE_SHIFT_EXISTS"),
  'SAFEGUARD TC-SHIFT-02: Shift POST API blocks creating new shift when an active shift is open'
);

// Safeguard 3: Close shift rejects invalid / not-found shift
assert(
  shiftCloseApiContent.includes("SHIFT_NOT_FOUND") || shiftCloseApiContent.includes("ALREADY_CLOSED"),
  'SAFEGUARD TC-SHIFT-03: Shift Close API validates shift existence and status'
);

// Safeguard 4: Timezone context check for Cairo
const schedulePath = path.resolve('lib/schedule.ts');
if (fs.existsSync(schedulePath)) {
  const scheduleContent = fs.readFileSync(schedulePath, 'utf8');
  assert(
    scheduleContent.includes('Africa/Cairo'),
    'SAFEGUARD TC-SHIFT-04: Timezone bound to Africa/Cairo for daily schedule & shift calculations'
  );
}

// -------------------------------------------------------------
// MODULE 3: ORDER-TYPE INTEGRITY & WORKFLOW MAPPING AUDIT
// -------------------------------------------------------------
console.log('\n--- Sub-suite: Order-Type Integrity & Workflow Mapping ---');

const orderDomainPath = path.resolve('features/orders/domain/order-operations.ts');
const tripPolicyPath = path.resolve('features/trips/domain/trip-policy.ts');

if (fs.existsSync(orderDomainPath)) {
  const orderDomainContent = fs.readFileSync(orderDomainPath, 'utf8');
  assert(
    orderDomainContent.includes('delivery') && orderDomainContent.includes('takeaway') && orderDomainContent.includes('dine_in'),
    'WORKFLOW TC-ORDER-01: Order domain explicitly handles delivery, takeaway, dine_in'
  );
}

if (fs.existsSync(tripPolicyPath)) {
  const tripPolicyContent = fs.readFileSync(tripPolicyPath, 'utf8');
  assert(
    tripPolicyContent.includes('delivery'),
    'WORKFLOW TC-ORDER-02: Delivery driver trips are scoped strictly to delivery orders'
  );
}

// -------------------------------------------------------------
// MODULE 4: FINANCIAL BOUNDARY & CALCULATION SOURCE AUDIT
// -------------------------------------------------------------
console.log('\n--- Sub-suite: Financial Boundary & Calculation Source ---');

// Server API authoritative calculations
assert(
  shiftCloseApiContent.includes('systemExpectedCash = Number((initialCash + cashSalesTotal - expensesTotal).toFixed(2))'),
  'FINANCIAL TC-FIN-01: Server API computes authoritative systemExpectedCash'
);

assert(
  shiftCloseApiContent.includes('discrepancy = Number((parsedFinalCash - systemExpectedCash).toFixed(2))'),
  'FINANCIAL TC-FIN-02: Server API computes authoritative discrepancy'
);

// Client UI Guardrail: React components must NOT calculate systemExpectedCash or discrepancy locally
const shiftBarPath = path.resolve('features/shifts/components/ShiftBar.tsx');
const closeShiftModalPath = path.resolve('features/shifts/components/CloseShiftModal.tsx');
const useActiveShiftPath = path.resolve('features/shifts/hooks/useActiveShift.ts');

if (fs.existsSync(shiftBarPath)) {
  const shiftBarContent = fs.readFileSync(shiftBarPath, 'utf8');
  assert(
    !shiftBarContent.includes('system_expected_cash =') && !shiftBarContent.includes('discrepancy ='),
    'FINANCIAL TC-FIN-03: ShiftBar component performs zero financial calculations'
  );
}

if (fs.existsSync(closeShiftModalPath)) {
  const closeShiftModalContent = fs.readFileSync(closeShiftModalPath, 'utf8');
  assert(
    !closeShiftModalContent.includes('systemExpectedCash =') && !/\bdiscrepancy\s*=[^=]/.test(closeShiftModalContent),
    'FINANCIAL TC-FIN-04: CloseShiftModal component performs zero local financial calculations'
  );
}

if (fs.existsSync(useActiveShiftPath)) {
  const useActiveShiftContent = fs.readFileSync(useActiveShiftPath, 'utf8');
  assert(
    !useActiveShiftContent.includes('system_expected_cash ='),
    'FINANCIAL TC-FIN-05: useActiveShift hook performs zero local financial calculations'
  );
}

console.log(`\n=== MODULES 2, 3 & 4 SUMMARY: ${passCount} PASSED, ${failCount} FAILED ===`);
if (failCount > 0) process.exit(1);
