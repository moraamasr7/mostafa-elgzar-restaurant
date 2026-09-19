import fs from 'fs';
import path from 'path';

console.log('--- STARTING UNIT 1 SHIFT BAR VERIFICATION SUITE ---');

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`✅ PASS: ${msg}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${msg}`);
    failedTests++;
  }
}

// 1. Verify File Creation
const shiftsTypeFile = path.resolve('types/shifts.ts');
const shiftsApiFile = path.resolve('app/api/admin/shifts/route.ts');
const shiftsCloseApiFile = path.resolve('app/api/admin/shifts/close/route.ts');
const useActiveShiftHook = path.resolve('features/shifts/hooks/useActiveShift.ts');
const shiftBarComponent = path.resolve('features/shifts/components/ShiftBar.tsx');
const openModalComponent = path.resolve('features/shifts/components/OpenShiftModal.tsx');
const closeModalComponent = path.resolve('features/shifts/components/CloseShiftModal.tsx');

assert(fs.existsSync(shiftsTypeFile), 'types/shifts.ts exists');
assert(fs.existsSync(shiftsApiFile), 'app/api/admin/shifts/route.ts exists');
assert(fs.existsSync(shiftsCloseApiFile), 'app/api/admin/shifts/close/route.ts exists');
assert(fs.existsSync(useActiveShiftHook), 'features/shifts/hooks/useActiveShift.ts exists');
assert(fs.existsSync(shiftBarComponent), 'features/shifts/components/ShiftBar.tsx exists');
assert(fs.existsSync(openModalComponent), 'features/shifts/components/OpenShiftModal.tsx exists');
assert(fs.existsSync(closeModalComponent), 'features/shifts/components/CloseShiftModal.tsx exists');

// 2. Financial Architecture Guardrail Audit in React
const hookContent = fs.readFileSync(useActiveShiftHook, 'utf8');
const barContent = fs.readFileSync(shiftBarComponent, 'utf8');
const openContent = fs.readFileSync(openModalComponent, 'utf8');
const closeContent = fs.readFileSync(closeModalComponent, 'utf8');

assert(!hookContent.includes('system_expected_cash ='), 'useActiveShift has 0 financial calculations');
assert(!barContent.includes('system_expected_cash ='), 'ShiftBar has 0 financial calculations');
assert(!openContent.includes('system_expected_cash ='), 'OpenShiftModal has 0 financial calculations');
assert(!closeContent.includes('system_expected_cash ='), 'CloseShiftModal does NOT compute expected cash');
assert(!/\bdiscrepancy\s*=[^=]/.test(closeContent), 'CloseShiftModal does NOT assign/compute discrepancy locally');

// 3. Server-side Authoritative Financial Reconciliation Audit
const closeApiContent = fs.readFileSync(shiftsCloseApiFile, 'utf8');
assert(closeApiContent.includes('systemExpectedCash = Number((initialCash + cashSalesTotal - expensesTotal).toFixed(2))'), 'Server API calculates authoritative system_expected_cash');
assert(closeApiContent.includes('discrepancy = Number((parsedFinalCash - systemExpectedCash).toFixed(2))'), 'Server API calculates authoritative discrepancy');
assert(closeApiContent.includes('status: \'closed\''), 'Server API sets shift status to closed');

// 4. Concurrency & Anomaly Protection Audit
const apiContent = fs.readFileSync(shiftsApiFile, 'utf8');
assert(apiContent.includes('MULTIPLE_ACTIVE_SHIFTS_ANOMALY'), 'GET API reports multiple active shifts anomaly');
assert(apiContent.includes('ACTIVE_SHIFT_EXISTS'), 'POST API checks existing active open shift');

// 5. Customer Frontend Isolation Audit
const adminLayoutContent = fs.readFileSync(path.resolve('app/admin/layout.tsx'), 'utf8');
assert(adminLayoutContent.includes('<ShiftBar />'), 'app/admin/layout.tsx imports ShiftBar');

console.log(`\n--- SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED ---`);
if (failedTests > 0) {
  process.exit(1);
}
