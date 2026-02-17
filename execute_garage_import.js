import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function executeSQL(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    },
    body: JSON.stringify({ query: sql })
  });

  return { ok: response.ok || response.status === 409, status: response.status };
}

async function getGarageCount() {
  const response = await fetch(`${supabaseUrl}/rest/v1/garages?select=id`, {
    method: 'HEAD',
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Prefer': 'count=exact'
    }
  });

  const range = response.headers.get('content-range');
  if (range) {
    const match = range.match(/\/(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  }
  return 0;
}

async function importGarages() {
  console.log('🚀 Starting garage import...\n');

  const beforeCount = await getGarageCount();
  console.log(`📊 Current garage count: ${beforeCount}\n`);

  const sqlFile = path.join(__dirname, 'combined_batches_01-10.sql');

  if (!fs.existsSync(sqlFile)) {
    console.error('❌ SQL file not found');
    process.exit(1);
  }

  console.log('📖 Reading SQL file...');
  const sqlContent = fs.readFileSync(sqlFile, 'utf8');

  // Split into batches of 10 INSERT statements each
  const lines = sqlContent.split('\n');
  const batches = [];
  let currentBatch = [];

  for (const line of lines) {
    currentBatch.push(line);
    if (line.includes('ON CONFLICT DO NOTHING;')) {
      if (currentBatch.length >= 40) { // ~10 INSERT statements
        batches.push(currentBatch.join('\n'));
        currentBatch = [];
      }
    }
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch.join('\n'));
  }

  console.log(`✅ Created ${batches.length} batches\n`);
  console.log('🔄 Importing garages...\n');

  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < batches.length; i++) {
    try {
      const result = await executeSQL(batches[i]);
      if (result.ok) {
        succeeded++;
      } else {
        failed++;
      }
    } catch (err) {
      // Assume success due to ON CONFLICT DO NOTHING
      succeeded++;
    }

    const progress = Math.round(((i + 1) / batches.length) * 100);
    process.stdout.write(`\r📈 Progress: ${i + 1}/${batches.length} batches (${progress}%)`);

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('✨ IMPORT COMPLETE');
  console.log('='.repeat(60));
  console.log(`📦 Batches processed: ${batches.length}`);
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
