import { POST } from '../app/api/orders/route';
import { NextRequest } from 'next/server';
import { isRestaurantOpen } from '../lib/schedule';
import { getReservationAvailability } from '../features/reservations/domain/reservation-availability';

async function runTests() {
  console.log('=== STARTING AUTOMATED EDGE-CASE & BACKEND CONTRACT TESTS ===\n');
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

  // TEST 1: Empty items array rejected
  try {
    const req = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer_name: 'محمد أحمد',
        customer_phone: '01012345678',
        order_type: 'delivery',
        delivery_address: 'شارع عمر المختار بجوار المسجد',
        items: [],
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    const json = await res.json();
    assert(
      res.status === 400 && json.error.includes('السلة يجب أن تحتوي'),
      'TC-EDGE-01: Empty cart rejection',
      `HTTP ${res.status}: ${json.error}`
    );
  } catch (e: any) {
    assert(false, 'TC-EDGE-01: Empty cart rejection', e.message);
  }

  // TEST 2: Invalid Egyptian phone rejected
  try {
    const req = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer_name: 'محمد أحمد',
        customer_phone: '01234',
        order_type: 'delivery',
        delivery_address: 'شارع عمر المختار بجوار المسجد',
        items: [{ variant_id: 'v-123', quantity: 1 }],
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    const json = await res.json();
    assert(
      res.status === 400 && json.error.includes('رقم الموبايل غير صحيح'),
      'TC-EDGE-02: Invalid Egyptian phone rejection',
      `HTTP ${res.status}: ${json.error}`
    );
  } catch (e: any) {
    assert(false, 'TC-EDGE-02: Invalid Egyptian phone rejection', e.message);
  }

  // TEST 3: Short delivery address rejected
  try {
    const req = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer_name: 'محمد أحمد',
        customer_phone: '01012345678',
        order_type: 'delivery',
        delivery_address: 'مصر',
        items: [{ variant_id: 'v-123', quantity: 1 }],
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    const json = await res.json();
    assert(
      res.status === 400 && json.error.includes('عنوان التوصيل مطلوب وبحد أدنى 5 أحرف'),
      'TC-EDGE-03: Short delivery address rejection',
      `HTTP ${res.status}: ${json.error}`
    );
  } catch (e: any) {
    assert(false, 'TC-EDGE-03: Short delivery address rejection', e.message);
  }

  // TEST 4: Takeaway order requires advance payment proof
  try {
    const req = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer_name: 'محمد أحمد',
        customer_phone: '01012345678',
        order_type: 'takeaway',
        payment_receipt_url: '',
        items: [{ variant_id: 'v-123', quantity: 1 }],
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    const json = await res.json();
    assert(
      res.status === 400 && json.error.includes('إثبات تحويل المبلغ'),
      'TC-EDGE-04: Takeaway missing payment receipt rejection',
      `HTTP ${res.status}: ${json.error}`
    );
  } catch (e: any) {
    assert(false, 'TC-EDGE-04: Takeaway missing payment receipt rejection', e.message);
  }

  // TEST 5: Rate-limiting duplicate submissions
  try {
    const testPayload = {
      customer_name: 'أحمد محمود',
      customer_phone: '01199998888',
      order_type: 'delivery',
      delivery_address: 'شارع الحرية بالمطرية عمارة 12',
      items: [{ variant_id: 'v-special-99', quantity: 2 }],
    };
    const req1 = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify(testPayload),
      headers: { 'Content-Type': 'application/json' },
    });
    const req2 = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify(testPayload),
      headers: { 'Content-Type': 'application/json' },
    });

    await POST(req1);
    const res2 = await POST(req2);
    const json2 = await res2.json();

    assert(
      res2.status === 429 && json2.error.includes('تم استقبال طلبك بالفعل'),
      'TC-EDGE-05: Anti-spam duplicate order rate limit (10s window)',
      `HTTP ${res2.status}: ${json2.error}`
    );
  } catch (e: any) {
    assert(false, 'TC-EDGE-05: Anti-spam duplicate order rate limit', e.message);
  }

  // TEST 6: Store schedule query verification
  try {
    const storeStatus = await isRestaurantOpen();
    assert(
      typeof storeStatus.isOpen === 'boolean' && typeof storeStatus.reason === 'string',
      'TC-EDGE-06: Authoritative store schedule function check',
      `isOpen: ${storeStatus.isOpen}, reason: "${storeStatus.reason}", timezone: ${storeStatus.timezone}`
    );
  } catch (e: any) {
    assert(false, 'TC-EDGE-06: Authoritative store schedule function check', e.message);
  }

  // TEST 7: Same-day reservation rule validation
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const availabilityToday = await getReservationAvailability(todayStr);
    assert(
      typeof availabilityToday.isOpen === 'boolean',
      'TC-EDGE-07: Same-day reservation check',
      `Today (${todayStr}) availability checked. Slots: ${availabilityToday.slots.length}`
    );

    // Past date rejection
    const pastDate = '2020-01-01';
    const pastRes = await getReservationAvailability(pastDate);
    assert(
      pastRes.isOpen === false && Boolean(pastRes.reason?.includes('الماضي')),
      'TC-EDGE-08: Past date reservation rejection',
      `Past date (${pastDate}) correctly rejected: "${pastRes.reason}"`
    );

    // Distant future date rejection
    const futureDate = '2030-01-01';
    const futureRes = await getReservationAvailability(futureDate);
    const hasReason = Boolean(futureRes.reason && (futureRes.reason.includes('لليوم الحالي فقط') || futureRes.reason.includes('اليوم')));
    const isClosed = futureRes.isOpen === false;
    assert(
      isClosed && hasReason,
      'TC-EDGE-09: Future date reservation restriction to same-day',
      `Future date (${futureDate}) rejected: isOpen=${futureRes.isOpen}, reason="${futureRes.reason}"`
    );
  } catch (e: any) {
    assert(false, 'TC-EDGE-07/08/09: Reservation domain check', e.message);
  }

  console.log(`\n=== RESULTS: ${passCount} PASSED, ${failCount} FAILED ===`);
  process.exit(failCount === 0 ? 0 : 1);
}

runTests();
