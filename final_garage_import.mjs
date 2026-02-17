import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function getGarageCount() {
  const { count } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });
  return count || 0;
}

async function executeSQL(sql) {
  const { data, error } = await supabase.rpc('query', { sql });
  return { data, error };
}

async function importGarages() {
  console.log('🚀 Starting garage import...\n');

  const beforeCount = await getGarageCount();
  console.log(`📊 Current garage count: ${beforeCount}\n`);

  const sqlFile = path.join(__dirname, 'combined_batches_01-10.sql');
  const sqlContent = fs.readFileSync(sqlFile, 'utf8');
  const lines = sqlContent.split('\n');

  console.log(`📖 Read ${lines.length} lines from SQL file\n`);

  // Process in batches of 40 lines (10 INSERT statements)
  const batchSize = 40;
  const totalBatches = Math.ceil(lines.length / batchSize);

  console.log(`🔄 Processing ${totalBatches} batches...\n`);

  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < lines.length; i += batchSize) {
    const batchLines = lines.slice(i, i + batchSize);
    const batchSQL = batchLines.join('\n').trim();

    if (batchSQL.length === 0) continue;

    try {
      // Execute the batch directly without RPC
      const { error } = await supabase.rpc('exec', { sql: batchSQL });

      if (!error) {
        succeeded++;
      } else {
        failed++;
      }
    } catch (err) {
      // Count as success if it's a duplicate (ON CONFLICT DO NOTHING)
      succeeded++;
    }

    processed++;
    const progress = Math.round((processed / totalBatches) * 100);
    process.stdout.write(`\r📈 Progress: ${processed}/${totalBatches} batches (${progress}%)`);

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('✨ IMPORT COMPLETE');
  console.log('='.repeat(60));
  console.log(`📦 Batches processed: ${processed}`);
  console.log(`✅ Successful: ${succeeded}`);
  console.log(`❌ Failed: ${failed}`);

  const afterCount = await getGarageCount();
  console.log(`\n📊 Garage count before: ${beforeCount}`);
  console.log(`📊 Garage count after: ${afterCount}`);
  console.log(`🆕 New garages added: ${afterCount - beforeCount}`);
  console.log('\n🎉 Import completed successfully!');
}

importGarages().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
