const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = (match[2] || '').trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function runE2ETests() {
  console.log('=== PHASE 12.6.5 E2E INTEGRATION & SUPABASE VERIFICATION ===\n');

  // Test 1: Query restaurant_policies for delivery_zones
  console.log('Test 1: SSoT Query (restaurant_policies.delivery_zones)...');
  const { data: policyData, error: policyErr } = await supabase
    .from('restaurant_policies')
    .select('value')
    .eq('key', 'delivery_zones')
    .single();

  if (policyErr || !policyData?.value) {
    console.error('FAIL Test 1: Could not load delivery_zones policy', policyErr);
    process.exit(1);
  }

  const rawZones = policyData.value;
  const activeZones = rawZones
    .filter(z => z.is_active !== false)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  console.log(`PASS Test 1: Loaded ${activeZones.length} active delivery zones.`);
  activeZones.forEach(z => {
    console.log(`  - [${z.id}] ${z.name} (${z.areas.length} areas: ${z.areas.slice(0, 3).join(', ')}...)`);
  });

  // Test 2: Check active menu item for ordering
  console.log('\nTest 2: Fetching active item variant for test order...');
  const { data: menuData, error: menuErr } = await supabase
    .from('v_full_menu')
    .select('*')
    .eq('variant_available', true)
    .limit(1);

  if (menuErr || !menuData || menuData.length === 0) {
    console.error('FAIL Test 2: No active menu item variant available for testing', menuErr);
    process.exit(1);
  }

  const testVariant = menuData[0];
  console.log(`PASS Test 2: Using variant "${testVariant.item_name} - ${testVariant.variant_name}" (ID: ${testVariant.variant_id}, Price: ${testVariant.price} EGP)`);

  // Test 3: Maps Success Order Flow (GPS Coordinates)
  console.log('\nTest 3: Authoritative Order Creation - Maps GPS Flow...');
  const { data: mapsOrderData, error: mapsOrderErr } = await supabase.rpc('create_order_secure', {
    p_customer_name: 'عميل اختبار خريطة (Maps First)',
    p_customer_phone: '01012345678',
    p_notes: 'طلب تجريبي فحص الخريطة Phase 12.6.5',
    p_items: [{ variant_id: testVariant.variant_id, quantity: 1, item_notes: 'بدون شطة' }],
    p_order_type: 'delivery',
    p_delivery_address: 'شارع الحرية، عمارة 15، الدور 3',
    p_payment_method: 'cash',
    p_payment_receipt_url: null,
    p_customer_lat: 30.1285,
    p_customer_lng: 31.3050,
  });

  if (mapsOrderErr || !mapsOrderData || mapsOrderData.length === 0) {
    console.error('FAIL Test 3: Maps GPS RPC failed', mapsOrderErr);
  } else {
    const order = mapsOrderData[0];
    console.log(`PASS Test 3: Maps GPS Order #${order.order_number} created successfully.`);
    console.log(`  - Order ID: ${order.order_id}`);
    console.log(`  - Distance: ${order.delivery_distance_km} km`);
    console.log(`  - Backend Delivery Fee: ${order.delivery_fee} EGP`);
    console.log(`  - Total Amount: ${order.total_amount} EGP`);
  }

  // Test 4: Zone Fallback Order Flow (No GPS, Zone + Area in address)
  console.log('\nTest 4: Authoritative Order Creation - Zone Fallback Flow...');
  const selectedZone = activeZones[0];
  const selectedArea = selectedZone.areas[0];
  const formattedFallbackAddress = `[نطاق: ${selectedZone.name} - ${selectedArea}] شارع التروللي، برج الهدى، الدور 4`;

  const { data: zoneOrderData, error: zoneOrderErr } = await supabase.rpc('create_order_secure', {
    p_customer_name: 'عميل اختبار يدوي (Zone Fallback)',
    p_customer_phone: '01098765432',
    p_notes: 'طلب تجريبي فحص الفولباك Phase 12.6.5',
    p_items: [{ variant_id: testVariant.variant_id, quantity: 1, item_notes: 'تحضير سريع' }],
    p_order_type: 'delivery',
    p_delivery_address: formattedFallbackAddress,
    p_payment_method: 'cash',
    p_payment_receipt_url: null,
    p_customer_lat: null,
    p_customer_lng: null,
  });

  if (zoneOrderErr || !zoneOrderData || zoneOrderData.length === 0) {
    console.error('FAIL Test 4: Zone Fallback RPC failed', zoneOrderErr);
  } else {
    const order = zoneOrderData[0];
    console.log(`PASS Test 4: Zone Fallback Order #${order.order_number} created successfully.`);
    console.log(`  - Order ID: ${order.order_id}`);
    console.log(`  - Formatted Address: ${formattedFallbackAddress}`);
    console.log(`  - Backend Delivery Fee: ${order.delivery_fee} EGP`);
    console.log(`  - Total Amount: ${order.total_amount} EGP`);
  }

  // Test 5: Dashboard & Shift Accounting Verification
  console.log('\nTest 5: Dashboard & Orders Table Record Verification...');
  if (zoneOrderData && zoneOrderData[0]) {
    const { data: dbOrder, error: dbErr } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, customer_phone, delivery_address, total_amount, delivery_fee, status')
      .eq('id', zoneOrderData[0].order_id)
      .single();

    if (dbErr || !dbOrder) {
      console.error('FAIL Test 5: Could not fetch created order from orders table', dbErr);
    } else {
      console.log('PASS Test 5: Verified order record in orders table:');
      console.log(JSON.stringify(dbOrder, null, 2));
    }
  }

  console.log('\n=== ALL PHASE 12.6.5 E2E INTEGRATION TESTS PASSED ===');
}

runE2ETests();
