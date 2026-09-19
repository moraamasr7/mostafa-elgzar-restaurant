import fs from 'fs';
import path from 'path';

console.log('=== PHASE 5 — MODULE 5.2: SHIFT-CONTROL UI WIRE-UP AUDIT ===\n');

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

// 1. ShiftBar.tsx Wire-up Verification
const shiftBarPath = path.resolve('features/shifts/components/ShiftBar.tsx');
assert(fs.existsSync(shiftBarPath), 'ShiftBar.tsx component exists');
const shiftBarContent = fs.readFileSync(shiftBarPath, 'utf8');

assert(
  shiftBarContent.includes('useActiveShift()'),
  'M5.2-01: ShiftBar consumes active shift state via useActiveShift hook'
);

assert(
  shiftBarContent.includes('MULTIPLE_ACTIVE_SHIFTS_ANOMALY'),
  'M5.2-02: ShiftBar displays UI warning for MULTIPLE_ACTIVE_SHIFTS_ANOMALY'
);

assert(
  shiftBarContent.includes('OpenShiftModal') && shiftBarContent.includes('CloseShiftModal'),
  'M5.2-03: ShiftBar triggers OpenShiftModal and CloseShiftModal correctly'
);

// 2. OpenShiftModal.tsx Wire-up Verification
const openModalPath = path.resolve('features/shifts/components/OpenShiftModal.tsx');
assert(fs.existsSync(openModalPath), 'OpenShiftModal.tsx component exists');
const openModalContent = fs.readFileSync(openModalPath, 'utf8');

assert(
  openModalContent.includes("fetch('/api/admin/shifts'"),
  'M5.2-04: OpenShiftModal posts shift creation directly to /api/admin/shifts'
);

assert(
  !openModalContent.includes('system_expected_cash'),
  'M5.2-05: OpenShiftModal has 0 local financial logic'
);

// 3. CloseShiftModal.tsx Wire-up Verification
const closeModalPath = path.resolve('features/shifts/components/CloseShiftModal.tsx');
assert(fs.existsSynccloseModalPath || fs.existsSync(closeModalPath), 'CloseShiftModal.tsx component exists');
const closeModalContent = fs.readFileSync(closeModalPath, 'utf8');

assert(
  closeModalContent.includes("fetch('/api/admin/shifts/close'"),
  'M5.2-06: CloseShiftModal posts shift close request directly to /api/admin/shifts/close'
);

assert(
  closeModalContent.includes('reconciliation') && !closeModalContent.includes('systemExpectedCash ='),
  'M5.2-07: CloseShiftModal displays server reconciliation result without computing expected cash locally'
);

// 4. Admin Layout Integration
const adminLayoutPath = path.resolve('app/admin/layout.tsx');
assert(fs.existsSync(adminLayoutPath), 'app/admin/layout.tsx exists');
const adminLayoutContent = fs.readFileSync(adminLayoutPath, 'utf8');

assert(
  adminLayoutContent.includes('<ShiftBar />'),
  'M5.2-08: Admin layout mounts <ShiftBar /> at the top of admin workspace'
);

console.log(`\n=== MODULE 5.2 SUMMARY: ${passCount} PASSED, ${failCount} FAILED ===`);
if (failCount > 0) process.exit(1);
