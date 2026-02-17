import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL(sql) {
  // Use the PostgreSQL REST API to execute raw SQL
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({ sql_query: sql })
  });

  if (!response.ok) {
    const text = await response.text();
    return { error: text };
  }

  return { success: true };
}

async function main() {
  console.log('🚀 Importing all garages...\n');

  const files = [
    'batch_import_aa', 'batch_import_ab', 'batch_import_ac', 'batch_import_ad', 'batch_import_ae',
    'batch_import_af', 'batch_import_ag', 'batch_import_ah', 'batch_import_ai', 'batch_import_aj'
  ];

  let totalImported = 0;

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const content = readFileSync(filename, 'utf-8');

    // Execute the batch
    const result = await executeSQL(content);

    if (result.success) {
      console.log(`✅ Batch ${i + 1}/10 (${filename})`);
      totalImported++;
    } else {
      console.log(`⚠️  Batch ${i + 1}/10 (${filename}) - ${result.error || 'likely duplicates'}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Count garages
  const { count } = await supabase.from('garages').select('*', { count: 'exact', head: true });

  console.log(`\n✨ Total garages in database: ${count}/500`);
  console.log(`📊 Batches imported: ${totalImported}/10\n`);
}

main();
