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

async function checkOrdersColumns() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error fetching orders:', error);
    return;
  }
  if (data && data.length > 0) {
    console.log('orders columns:', Object.keys(data[0]));
    console.log('Sample order:', JSON.stringify(data[0], null, 2));
  } else {
    console.log('No orders found');
  }
}

checkOrdersColumns();
