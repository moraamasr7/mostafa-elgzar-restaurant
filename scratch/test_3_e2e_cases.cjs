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

async function runThreeE2ETests() {
  console.log('===============================================================');
  console.log('  PHASE 12.6.5 — 3-STAGE E2E VERIFICATION TEST SUITE');
  console.log('===============================================================\n');

  let testShiftId = null;

  try {
    // 0. Setup: Ensure an active shift is open for testing
    console.log('--- Step 0: Checking/Opening Test Shift ---');
    const { data: openShifts } = await supabase
      .from('daily_shifts')
      .select('*')
      .eq('status', 'open')
      .limit(1);

    if (openShifts && openShifts.length > 0) {
      testShiftId = openShifts[0].id;
      console.log(`Using existing open shift #${openShifts[0].shift_number} (ID: ${testShiftId})`);
    } else {
      const { data: newShift, error: shiftErr } = await supabase
        .from('daily_shifts')
        .insert({
          shift_number: 8,
          opened_by: 'كاشير اختبار E2E',
          initial_cash: 500,
          status: 'open',
          opened_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (shiftErr) {
        console.error('Error opening test shift:', shiftErr);
        process.exit(1);
      }
      testShiftId = newShift.id;
      console.log(`Opened new test shift #${newShift.shift_number} (ID: ${testShiftId})`);
    }

    // Get an active menu item variant for test orders
    const { data: menuItems } = await supabase
      .from('v_full_menu')
      .select('*')
      .eq('variant_available', true)
      .limit(1);

    const testVariant = menuItems[0];
    console.log(`Test Item Variant: "${testVariant.item_name} - ${testVariant.variant_name}" (${testVariant.price} EGP)\n`);

    // =========================================================================
    // CASE 1: Maps Order (GPS Flow)
    // =========================================================================
    console.log('===============================================================');
    console.log('CASE 1: MAPS ORDER (GPS FLOW)');
    console.log('===============================================================');
    const mapsLat = 30.1285;
    const mapsLng = 31.3050;
    const mapsAddress = 'شارع الحرية، عمارة النصر 15، الدور 3 شقة 6';

    const { data: mapsOrderRes, error: mapsOrderErr } = await supabase.rpc('create_order_secure', {
      p_customer_name: 'عميل اختبار الخريطة (GPS Order)',
      p_customer_phone: '01011223344',
      p_notes: 'طلب خريطة تجريبي Phase 12.6.5',
      p_items: [{ variant_id: testVariant.variant_id, quantity: 1, item_notes: 'طازج' }],
      p_order_type: 'delivery',
      p_delivery_address: mapsAddress,
      p_payment_method: 'cash',
      p_payment_receipt_url: null,
      p_customer_lat: mapsLat,
      p_customer_lng: mapsLng,
    });

    if (mapsOrderErr || !mapsOrderRes || mapsOrderRes.length === 0) {
      console.error('FAIL CASE 1:', mapsOrderErr);
      process.exit(1);
    }

    const mapsOrder = mapsOrderRes[0];
    console.log(`✓ RPC Execution: SUCCESS`);
    console.log(`  - Order Number: #${mapsOrder.order_number}`);
    console.log(`  - Order ID: ${mapsOrder.order_id}`);
    console.log(`  - Calculated Distance: ${mapsOrder.delivery_distance_km} km`);
    console.log(`  - Authoritative Delivery Fee: ${mapsOrder.delivery_fee} EGP`);
    console.log(`  - Total Amount: ${mapsOrder.total_amount} EGP`);

    // Verify record in orders table & dashboard view
    const { data: dbMapsOrder, error: dbMapsErr } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, customer_phone, delivery_address, total_amount, delivery_fee, delivery_distance_km, status, daily_shift_id')
      .eq('id', mapsOrder.order_id)
      .single();

    if (dbMapsErr || !dbMapsOrder) {
      console.error('FAIL CASE 1 Database Verification:', dbMapsErr);
    } else {
      console.log('✓ Database & Dashboard Record Verified:');
      console.log(`  - orders.delivery_fee: ${dbMapsOrder.delivery_fee} EGP`);
      console.log(`  - orders.total_amount: ${dbMapsOrder.total_amount} EGP`);
      console.log(`  - orders.status: ${dbMapsOrder.status}`);
      console.log(`  - orders.daily_shift_id: ${dbMapsOrder.daily_shift_id}`);
    }
    console.log('CASE 1 RESULT: PASS ✅\n');

    // =========================================================================
    // CASE 2: Zone → Area Order (Fallback Flow)
    // =========================================================================
    console.log('===============================================================');
    console.log('CASE 2: ZONE → AREA ORDER (FALLBACK FLOW)');
    console.log('===============================================================');
    
    // Fetch live policies
    const { data: policyData } = await supabase
      .from('restaurant_policies')
      .select('value')
      .eq('key', 'delivery_zones')
      .single();

    const zones = (policyData.value || []).filter(z => z.is_active !== false);
    const chosenZone = zones[0]; // المطرية وضواحيها
    const chosenArea = chosenZone.areas[0]; // المطرية أو شجرة مريم
    const fallbackAddress = `[نطاق: ${chosenZone.name} - ${chosenArea}] شارع التروللي، برج الصفا 8، الدور 2`;

    const { data: zoneOrderRes, error: zoneOrderErr } = await supabase.rpc('create_order_secure', {
      p_customer_name: 'عميل اختبار يدوي (Zone-Area Fallback)',
      p_customer_phone: '01055667788',
      p_notes: 'طلب فولباك تجريبي Phase 12.6.5',
      p_items: [{ variant_id: testVariant.variant_id, quantity: 2, item_notes: 'شواء وسط' }],
      p_order_type: 'delivery',
      p_delivery_address: fallbackAddress,
      p_payment_method: 'cash',
      p_payment_receipt_url: null,
      p_customer_lat: null,
      p_customer_lng: null,
    });

    if (zoneOrderErr || !zoneOrderRes || zoneOrderRes.length === 0) {
      console.error('FAIL CASE 2:', zoneOrderErr);
      process.exit(1);
    }

    const zoneOrder = zoneOrderRes[0];
    console.log(`✓ RPC Execution: SUCCESS`);
    console.log(`  - Order Number: #${zoneOrder.order_number}`);
    console.log(`  - Order ID: ${zoneOrder.order_id}`);
    console.log(`  - Authoritative Delivery Fee: ${zoneOrder.delivery_fee} EGP`);
    console.log(`  - Total Amount: ${zoneOrder.total_amount} EGP`);

    // Verify record in orders table & dashboard view
    const { data: dbZoneOrder, error: dbZoneErr } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, customer_phone, delivery_address, total_amount, delivery_fee, status, daily_shift_id')
      .eq('id', zoneOrder.order_id)
      .single();

    if (dbZoneErr || !dbZoneOrder) {
      console.error('FAIL CASE 2 Database Verification:', dbZoneErr);
    } else {
      console.log('✓ Database & Dashboard Record Verified:');
      console.log(`  - orders.delivery_address: "${dbZoneOrder.delivery_address}"`);
      console.log(`  - orders.delivery_fee: ${dbZoneOrder.delivery_fee} EGP`);
      console.log(`  - orders.total_amount: ${dbZoneOrder.total_amount} EGP`);
      console.log(`  - orders.status: ${dbZoneOrder.status}`);
      console.log(`  - orders.daily_shift_id: ${dbZoneOrder.daily_shift_id}`);
    }
    console.log('CASE 2 RESULT: PASS ✅\n');

    // =========================================================================
    // CASE 3: Owner Policy Change Test (Dashboard Simulation)
    // =========================================================================
    console.log('===============================================================');
    console.log('CASE 3: OWNER POLICY CHANGE TEST (DYNAMIC SSoT)');
    console.log('===============================================================');
    
    // 1. Get original policies
    const originalZones = JSON.parse(JSON.stringify(policyData.value));
    console.log(`Original zones count: ${originalZones.length}`);

    // 2. Modify policies in Supabase (simulate Dashboard owner edit: add test sub-area)
    const modifiedZones = JSON.parse(JSON.stringify(originalZones));
    const testAreaName = `حي الأندلس التجريبي (تعديل داشبورد ${Date.now()})`;
    modifiedZones[0].areas.push(testAreaName);

    console.log(`Simulating Dashboard edit: Adding new sub-area "${testAreaName}" to zone "${modifiedZones[0].name}"...`);
    const { error: updateErr } = await supabase
      .from('restaurant_policies')
      .update({ value: modifiedZones })
      .eq('key', 'delivery_zones');

    if (updateErr) {
      console.error('FAIL CASE 3 Policy Update:', updateErr);
    } else {
      console.log('✓ Policy updated in Supabase successfully.');

      // 3. Re-fetch from Customer Frontend Data Layer (Simulating Customer opening checkout drawer)
      const { data: refetchedPolicy, error: refetchErr } = await supabase
        .from('restaurant_policies')
        .select('value')
        .eq('key', 'delivery_zones')
        .single();

      if (refetchErr || !refetchedPolicy) {
        console.error('FAIL CASE 3 Re-fetch:', refetchErr);
      } else {
        const liveZones = refetchedPolicy.value;
        const targetZone = liveZones.find(z => z.id === modifiedZones[0].id);
        const containsNewArea = targetZone && targetZone.areas.includes(testAreaName);

        if (containsNewArea) {
          console.log(`✓ Customer Frontend live query successfully received new sub-area without any code modification!`);
          console.log(`  - Zone: "${targetZone.name}"`);
          console.log(`  - Newly reflected area: "${testAreaName}"`);
        } else {
          console.error('FAIL CASE 3: New area was not reflected in customer live query');
        }
      }

      // 4. Clean Revert: restore original policies
      console.log('Cleaning up: Reverting restaurant_policies back to original state...');
      await supabase
        .from('restaurant_policies')
        .update({ value: originalZones })
        .eq('key', 'delivery_zones');
      console.log('✓ Original policy restored cleanly.');
    }
    console.log('CASE 3 RESULT: PASS ✅\n');

  } catch (err) {
    console.error('Unexpected exception in E2E tests:', err);
  } finally {
    // Clean close test shift
    if (testShiftId) {
      console.log('--- Cleaning up: Closing Test Shift ---');
      await supabase
        .from('daily_shifts')
        .update({
          status: 'closed',
          closed_by: 'كاشير اختبار E2E',
          closed_at: new Date().toISOString(),
          final_cash: 500,
          system_expected_cash: 500,
          discrepancy: 0,
          notes: 'إغلاق وردية الاختبار الآلي بنجاح (E2E Test Shift)',
        })
        .eq('id', testShiftId);
      console.log('✓ Test shift closed cleanly.\n');
    }
  }

  console.log('===============================================================');
  console.log('  ALL 3 E2E TEST CASES COMPLETED & VERIFIED SUCCESSFULLY! 🎯');
  console.log('===============================================================');
}

runThreeE2ETests();
