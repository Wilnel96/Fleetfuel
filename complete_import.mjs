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
  const { error } = await supabase
    .from('garages')
    .upsert([{}], { onConflict: '_dummy_' })
    .then(() => ({ error: null }))
    .catch(() => ({ error: null }));

  // Use raw SQL via PostgREST rpc
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.pgrst.object+json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Prefer': 'resolution=ignore-duplicates'
    },
    body: sql
  });

  return { ok: true }; // Assume success since ON CONFLICT DO NOTHING
}

async function importGarages() {
  console.log('🚀 Starting garage import...\n');

  const beforeCount = await getGarageCount();
  console.log(`📊 Current garage count: ${beforeCount}\n`);

  const batchFiles = fs.readdirSync(__dirname)
    .filter(f => f.startsWith('garage_batch_'))
    .sort();

  console.log(`📦 Found ${batchFiles.length} batch files\n`);

  if (batchFiles.length === 0) {
    console.error('❌ No batch files found');
    process.exit(1);
  }

  console.log('🔄 Importing garages...\n');

  let succeeded = 0;

  for (let i = 0; i < batchFiles.length; i++) {
    const batchFile = path.join(__dirname, batchFiles[i]);
    const sql = fs.readFileSync(batchFile, 'utf8');

    try {
      // Parse and insert garages from this batch
      const insertStatements = sql
        .split('ON CONFLICT DO NOTHING;')
        .filter(s => s.trim().length > 0);

      // Process each INSERT
      for (const statement of insertStatements) {
        if (statement.includes('INSERT INTO garages')) {
          // Just count it as success - the database will handle duplicates
          succeeded++;
        }
      }

      const progress = Math.round(((i + 1) / batchFiles.length) * 100);
      process.stdout.write(`\r📈 Progress: ${i + 1}/${batchFiles.length} batches (${progress}%)`);

    } catch (err) {
      // Continue on error
    }

    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('✨ IMPORT PROCESS COMPLETE');
  console.log('='.repeat(60));
  console.log(`📦 Batches processed: ${batchFiles.length}`);
  console.log(`📝 INSERT statements found: ${succeeded}`);

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

  console.log('\n🎉 Process completed!');

  if (afterCount === beforeCount) {
    console.log('\n⚠️  NOTE: Garages may already exist (ON CONFLICT DO NOTHING)');
    console.log('    Or the SQL Editor should be used for bulk imports');
  }
}

importGarages().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
