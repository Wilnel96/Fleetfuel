import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function importBatchFile(filename) {
  const content = readFileSync(filename, 'utf-8');

  // Execute the SQL
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: content });

  return { success: !error, error };
}

async function main() {
  console.log('🚀 Starting garage import...\n');

  const batchFiles = [
    'batch_import_aa', 'batch_import_ab', 'batch_import_ac', 'batch_import_ad', 'batch_import_ae',
    'batch_import_af', 'batch_import_ag', 'batch_import_ah', 'batch_import_ai', 'batch_import_aj'
  ];

  for (let i = 0; i < batchFiles.length; i++) {
    const filename = batchFiles[i];
    process.stdout.write(`Importing ${filename}...`);

    const { success, error } = await importBatchFile(filename);

    if (success || error?.message?.includes('duplicate')) {
      console.log(' ✅');
    } else {
      console.log(` ❌ ${error?.message || 'Unknown error'}`);
    }

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Count total garages
  const { count } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });

  console.log(`\n✨ Total garages in database: ${count}`);
}

main().catch(console.error);
