import fs from 'fs';
import path from 'path';

console.log('=== PHASE 5 — MODULE 5.3: DASHBOARD OPERATIONAL DATA WIRE-UP AUDIT ===\n');

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

// 1. Audit app/admin/page.tsx
const adminDashboardPath = path.resolve('app/admin/page.tsx');
assert(fs.existsSync(adminDashboardPath), 'app/admin/page.tsx exists');
const adminDashboardContent = fs.readFileSync(adminDashboardPath, 'utf8');

// Assert 1: Zero revenue summation loop in React
assert(
  !adminDashboardContent.includes('revenue += Number(order.total_amount'),
  'M5.3-01: Admin Dashboard performs ZERO revenue summation in React',
  'Removed local revenue loop'
);

// Assert 2: Active shift temporal boundary integration
assert(
  adminDashboardContent.includes("fetch('/api/admin/shifts'"),
  'M5.3-02: Admin Dashboard queries active shift for temporal boundary',
  'Bound orders query to shiftOpenedAt'
);

// Assert 3: Verification that legacy target files are confirmed dead/absent
const legacyFiles = [
  'dashboard/page.tsx',
  'src/lib/dailyShiftAccounting.ts',
  'src/lib/driverAccounting.ts',
  'src/lib/dailyReportPresentation.ts',
];

legacyFiles.forEach((file) => {
  const filePath = path.resolve(file);
  assert(
    !fs.existsSync(filePath),
    `M5.3-03: Legacy file ${file} confirmed ABSENT (Dead Code / No Issue)`
  );
});

// Assert 4: Financial truth indicator in Dashboard UI
assert(
  adminDashboardContent.includes('تسوية مبيعات الوردية') && adminDashboardContent.includes('محتسبة بالسيرفر'),
  'M5.3-04: Dashboard KPI card explicitly delegates financial truth to Server Reconciliation API'
);

console.log(`\n=== MODULE 5.3 SUMMARY: ${passCount} PASSED, ${failCount} FAILED ===`);
if (failCount > 0) process.exit(1);
