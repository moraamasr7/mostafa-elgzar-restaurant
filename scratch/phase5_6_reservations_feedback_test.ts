import fs from 'fs';
import path from 'path';

console.log('=== PHASE 5 — MODULE 5.6: RESERVATIONS & FEEDBACK UI AUDIT ===\n');

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

// 1. Audit TableReservationModal.tsx
const reservationModalPath = path.resolve('features/reservations/components/TableReservationModal.tsx');
assert(fs.existsSync(reservationModalPath), 'TableReservationModal.tsx file existence');
const reservationModalContent = fs.readFileSync(reservationModalPath, 'utf8');

assert(
  !/\border_source\b/.test(reservationModalContent),
  'CONTRACT CHECK M5.6-01: TableReservationModal contains 0 references to order_source'
);

assert(
  !/\bdaily_shift_id\b/.test(reservationModalContent) && !/\bshift_id\b/.test(reservationModalContent),
  'CONTRACT CHECK M5.6-02: TableReservationModal contains 0 references to daily_shift_id or shift_id'
);

assert(
  reservationModalContent.includes("fetch('/api/reservations'"),
  'M5.6-03: TableReservationModal wires to /api/reservations API handler'
);

assert(
  reservationModalContent.includes('egPhoneRegex') || reservationModalContent.includes('cleanPhone'),
  'M5.6-04: TableReservationModal enforces Egyptian phone validation'
);

// 2. Audit CustomerFeedbackModal.tsx
const feedbackModalPath = path.resolve('features/feedback/components/CustomerFeedbackModal.tsx');
assert(fs.existsSync(feedbackModalPath), 'CustomerFeedbackModal.tsx file existence');
const feedbackModalContent = fs.readFileSync(feedbackModalPath, 'utf8');

assert(
  !/\border_source\b/.test(feedbackModalContent),
  'CONTRACT CHECK M5.6-05: CustomerFeedbackModal contains 0 references to order_source'
);

assert(
  feedbackModalContent.includes("fetch('/api/feedback'"),
  'M5.6-06: CustomerFeedbackModal wires to /api/feedback API handler'
);

assert(
  feedbackModalContent.includes('submitting') && feedbackModalContent.includes('disabled={submitting}'),
  'SAFETY M5.6-07: CustomerFeedbackModal locks button during submit to prevent duplicate submissions'
);

// 3. Audit Reservations API Route app/api/reservations/route.ts
const reservationsApiPath = path.resolve('app/api/reservations/route.ts');
assert(fs.existsSync(reservationsApiPath), 'app/api/reservations/route.ts file existence');
const reservationsApiContent = fs.readFileSync(reservationsApiPath, 'utf8');

assert(
  reservationsApiContent.includes('create_reservation_secure'),
  'CONTRACT CHECK M5.6-08: Reservations API handler delegates insertion to create_reservation_secure RPC'
);

assert(
  reservationsApiContent.includes('recentReservationsMap') && reservationsApiContent.includes('429'),
  'SAFETY M5.6-09: Reservations API handler enforces 60s anti-spam rate limiting'
);

// 4. Audit Feedback API Route app/api/feedback/route.ts
const feedbackApiPath = path.resolve('app/api/feedback/route.ts');
assert(fs.existsSync(feedbackApiPath), 'app/api/feedback/route.ts file existence');
const feedbackApiContent = fs.readFileSync(feedbackApiPath, 'utf8');

assert(
  feedbackApiContent.includes('submit_feedback_secure'),
  'CONTRACT CHECK M5.6-10: Feedback API handler delegates insertion to submit_feedback_secure RPC'
);

assert(
  feedbackApiContent.includes('recentFeedbackMap') && feedbackApiContent.includes('429'),
  'SAFETY M5.6-11: Feedback API handler enforces 60s anti-spam rate limiting'
);

console.log(`\n=== MODULE 5.6 SUMMARY: ${passCount} PASSED, ${failCount} FAILED ===`);
if (failCount > 0) process.exit(1);
