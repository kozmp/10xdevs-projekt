// check-env.js - Sprawdzenie zmiennych środowiskowych
import { createClient } from '@supabase/supabase-js';

console.log('Checking environment variables...\n');

const requiredVars = {
  PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY
};

let allSet = true;
for (const [key, value] of Object.entries(requiredVars)) {
  if (value) {
    console.log(`✓ ${key}: SET (${value.substring(0, 20)}...)`);
  } else {
    console.log(`✗ ${key}: NOT SET`);
    allSet = false;
  }
}

if (!allSet) {
  console.log('\n⚠️  Please set missing environment variables in .env file');
  process.exit(1);
}

// Test połączenia z Supabase
console.log('\n🔗 Testing Supabase connection...');
const supabase = createClient(
  requiredVars.PUBLIC_SUPABASE_URL,
  requiredVars.PUBLIC_SUPABASE_ANON_KEY
);

try {
  const { data, error } = await supabase.from('shops').select('count').limit(1);
  if (error) {
    console.log('❌ Supabase connection failed:', error.message);
  } else {
    console.log('✅ Supabase connection successful!');
  }
} catch (err) {
  console.log('❌ Error:', err.message);
}

console.log('\n📝 Note: You need a valid JWT token to test API endpoints.');
console.log('   Token in test-endpoint.js is from LOCAL Supabase (127.0.0.1:54321)');
console.log('   If you are using cloud Supabase, you need to generate a new token.');
