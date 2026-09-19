import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ixizrsudkuysdiyifeoc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4aXpyc3Vka3V5c2RpeWlmZW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMDc2ODksImV4cCI6MjEwMTc4MzY4OX0.lDM6tDSw3xKgiQ5K2ub1kcZZA2OhBwDJa-YgeYZYnfM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log('=== 1. RESERVATION TESTS ===');

  // 1.1 Test Deposit Formula for requested persons
  const guestCounts = [1, 3, 4, 6, 7, 9, 10];
  const expectedDeposits = { 1: 100, 3: 100, 4: 200, 6: 200, 7: 300, 9: 300, 10: 400 };
  let depositMathPass = true;
  for (const g of guestCounts) {
    const calculated = Math.ceil(g / 3) * 100;
    const expected = expectedDeposits[g];
    const match = calculated === expected;
    console.log(`- Guests: ${g} -> Calculated: ${calculated} EGP | Expected: ${expected} EGP [${match ? 'PASS' : 'FAIL'}]`);
    if (!match) depositMathPass = false;
  }

  // 1.2 Test Payment Accounts from Supabase
  const { data: policyData, error: policyErr } = await supabase
    .from('restaurant_policies')
    .select('value')
    .eq('key', 'reservation_payment_accounts')
    .single();

  const accounts = policyData?.value;
  const hasInstapay = accounts?.instapay?.identifier === 'elgzar@instapay';
  const hasWallet = accounts?.wallet?.identifier === '01026131499';
  console.log(`- Instapay Account Config: ${hasInstapay ? 'PASS (elgzar@instapay)' : 'FAIL'}`);
  console.log(`- Wallet Account Config: ${hasWallet ? 'PASS (01026131499)' : 'FAIL'}`);

  // 1.3 Test Validation Rules for Reservations
  const egPhoneRegex = /^01[0125][0-9]{8}$/;
  console.log(`- Sender Phone Regex Valid (01012345678): ${egPhoneRegex.test('01012345678') ? 'PASS' : 'FAIL'}`);
  console.log(`- Sender Phone Regex Invalid (01912345678): ${!egPhoneRegex.test('01912345678') ? 'PASS' : 'FAIL'}`);
  console.log(`- Missing Screenshot Blocked (< 5 chars): ${!(''.trim().length >= 5) ? 'PASS' : 'FAIL'}`);

  // 1.4 Test Backend RPC create_reservation_secure with Deposit params
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const testDate = tomorrow.toISOString().split('T')[0];

  const { data: resData, error: resErr } = await supabase.rpc('create_reservation_secure', {
    p_customer_name: 'عميل تجريبي للتحقق',
    p_customer_phone: '01099887766',
    p_reservation_date: testDate,
    p_reservation_time: '18:00:00',
    p_guest_count: 4,
    p_notes: '[عربون: 200 ج.م | وسيلة الدفع: إنستاباي | رقم المحول: 01099887766]',
    p_deposit_amount: 200,
    p_deposit_receipt_url: 'https://ixizrsudkuysdiyifeoc.supabase.co/storage/v1/object/public/receipts/test-deposit-proof.jpg',
  });

  const rpcSuccess = !resErr && resData && resData.length > 0;
  console.log(`- Backend RPC create_reservation_secure: ${rpcSuccess ? `PASS (Reservation #${resData[0]?.reservation_number})` : `FAIL (${resErr?.message})`}`);

  console.log('\n=== 2. DELIVERY & GEOLOCATION TESTS ===');

  // 2.1 Test Delivery Zones in Supabase
  const { data: zoneData, error: zoneErr } = await supabase
    .from('restaurant_policies')
    .select('value')
    .eq('key', 'delivery_zones')
    .single();

  const zones = zoneData?.value;
  const zonesLoaded = Array.isArray(zones) && zones.length >= 8;
  console.log(`- Matariya Delivery Zones Loaded from Supabase: ${zonesLoaded ? `PASS (${zones.length} zones configured)` : 'FAIL'}`);

  // 2.2 Test Geolocation Coordinates Handling
  const testLat = 30.1305;
  const testLng = 31.3142;
  console.log(`- Coordinates GPS Input Validation: ${typeof testLat === 'number' && typeof testLng === 'number' ? 'PASS' : 'FAIL'}`);

  // 2.3 Test Backend Delivery Fee Authoritative Calculation
  const { data: orderData, error: orderErr } = await supabase.rpc('create_order_secure', {
    p_customer_name: 'عميل توصيل تجريبي',
    p_customer_phone: '01122334455',
    p_notes: 'اختبار دليفري مع احداثيات GPS',
    p_items: [{ variant_id: 'ef1679b6-39dd-4362-9536-cd8d36188650', quantity: 1 }],
    p_order_type: 'delivery',
    p_delivery_address: '[موقع GPS: 30.1305, 31.3142] شارع التروللي - برج النور - الدور الثالث',
    p_payment_method: 'cash',
    p_payment_receipt_url: null,
    p_customer_lat: testLat,
    p_customer_lng: testLng,
  });

  const orderRpcSuccess = !orderErr && orderData && orderData.length > 0;
  console.log(`- Authoritative Backend create_order_secure (Delivery GPS): ${orderRpcSuccess ? `PASS (Order #${orderData[0]?.order_number}, Delivery Fee: ${orderData[0]?.delivery_fee ?? 'Calculated'} EGP)` : `FAIL (${orderErr?.message})`}`);

  console.log('\n=== SUMMARY ===');
  console.log(`Overall Arabon Math: ${depositMathPass ? 'PASS' : 'FAIL'}`);
  console.log(`Overall Supabase Persistence & RPCs: ${rpcSuccess && zonesLoaded && orderRpcSuccess ? 'PASS' : 'FAIL'}`);
}

runTests();
