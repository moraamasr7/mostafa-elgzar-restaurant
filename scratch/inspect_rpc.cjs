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

async function inspectRPC() {
  console.log('Inspecting create_order_secure RPC in Supabase...');
  // Check if we can open a temporary test shift or if there is a shift
  const { data: shifts } = await supabase.from('daily_shifts').select('*').order('opened_at', { ascending: false }).limit(1);
  console.log('Latest shift:', shifts);
}

inspectRPC();
