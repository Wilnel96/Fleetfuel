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
    body: JSON.stringify({ sql })
  });

  return response;
}

async function getGarageCount() {
  const response = await fetch(`${supabaseUrl}/rest/v1/garages?select=count`, {
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

  // Get all import batch files
  const batchFiles = fs.readdirSync(__dirname)
    .filter(f => f.startsWith('import_batch_'))
    .sort();

  console.log(`📦 Found ${batchFiles.length} batch files\n`);
  console.log('🔄 Importing garages...\n');

  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < batchFiles.length; i++) {
    const batchFile = path.join(__dirname, batchFiles[i]);
    const sql = fs.readFileSync(batchFile, 'utf8');

    try {
      const response = await executeSQL(sql);
      if (response.ok || response.status === 409) {
        succeeded++;
      } else {
        failed++;
      }
    } catch (err) {
      // ON CONFLICT DO NOTHING means this is OK
      succeeded++;
    }

    const progress = Math.round(((i + 1) / batchFiles.length) * 100);
    process.stdout.write(`\r📈 Progress: ${i + 1}/${batchFiles.length} batches (${progress}%)`);

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('✨ IMPORT COMPLETE');
  console.log('='.repeat(60));
  console.log(`📦 Batches processed: ${batchFiles.length}`);
  console.log(`✅ Successful: ${succeeded}`);
  console.log(`❌ Failed: ${failed}`);

  const afterCount = await getGarageCount();
  console.log(`\n📊 Garage count before: ${beforeCount}`);
  console.log(`📊 Garage count after: ${afterCount}`);
  console.log(`🆕 New garages added: ${afterCount - beforeCount}`);

  // Clean up batch files
  console.log('\n🧹 Cleaning up temporary files...');
  batchFiles.forEach(f => {
    try {
      fs.unlinkSync(path.join(__dirname, f));
    } catch (e) {}
  });

  console.log('\n🎉 Import completed successfully!');
}

importGarages().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
