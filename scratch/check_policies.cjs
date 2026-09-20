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

async function checkPolicies() {
  const { data, error } = await supabase
    .from('restaurant_policies')
    .select('*');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('restaurant_policies keys:', data.map(d => d.key));
  data.forEach(d => {
    console.log(`\n=== KEY: ${d.key} === (${d.description || 'No description'})`);
    console.log(JSON.stringify(d.value, null, 2));
  });
}

checkPolicies();
