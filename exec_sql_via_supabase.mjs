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

const batchesDir = path.join(__dirname, 'sql_batches');

async function executeBatchFile(filePath, batchNum, total) {
  const fileName = path.basename(filePath);
  process.stdout.write(`[${batchNum}/${total}] ${fileName}... `);

  try {
    const sql = fs.readFileSync(filePath, 'utf8');

    // Execute SQL directly using the RPC endpoint
    // Since Supabase doesn't have a built-in RPC for raw SQL, we'll use the REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      // Try alternative: just execute inserts in a transaction
      // Count statements
      const insertCount = (sql.match(/INSERT INTO/g) || []).length;

      // Since direct SQL execution isn't available, we log for manual execution
      console.log(`📋 ${insertCount} statements (needs manual execution or psql)`);
      return { success: false, count: insertCount, needsManual: true };
    }

    const insertCount = (sql.match(/INSERT INTO/g) || []).length;
    console.log(`✅ ${insertCount} statements executed`);
    return { success: true, count: insertCount };
  } catch (error) {
    console.log(`❌ ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('Starting SQL batch execution...\n');

  const files = fs.readdirSync(batchesDir)
    .filter(f => f.startsWith('batch_') && f.endsWith('.sql'))
    .sort()
    .map(f => path.join(batchesDir, f));

  console.log(`Found ${files.length} batch files\n`);

  let successCount = 0;
  let totalRecords = 0;
  let needsManual = false;
  const errors = [];

  for (let i = 0; i < files.length; i++) {
    const result = await executeBatchFile(files[i], i + 1, files.length);

    if (result.success) {
      successCount++;
      totalRecords += result.count || 0;
    } else if (result.needsManual) {
      needsManual = true;
      totalRecords += result.count || 0;
    } else {
      errors.push({ file: path.basename(files[i]), error: result.error });
    }

    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log('\n' + '='.repeat(50));
  console.log('EXECUTION SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total batches: ${files.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${errors.length}`);
  console.log(`Total statements: ${totalRecords}`);

  if (needsManual) {
    console.log('\n⚠️  Direct SQL execution not available via Supabase JS client');
    console.log('   The batches need to be executed via:');
    console.log('   1. Supabase Dashboard SQL Editor, or');
    console.log('   2. psql with direct database connection');
  }

  if (errors.length > 0) {
    console.log('\n❌ Failed batches:');
    errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }
}

main().catch(console.error);
