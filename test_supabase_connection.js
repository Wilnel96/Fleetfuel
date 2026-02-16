import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl);
console.log('Key (first 20 chars):', supabaseServiceKey?.substring(0, 20));

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('\nTesting connection...');

const { data, error } = await supabase
  .from('organizations')
  .select('id, name')
  .limit(1);

if (error) {
  console.error('Error:', error);
} else {
  console.log('Success! Found organizations:', data);
}
