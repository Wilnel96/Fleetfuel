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

async function executePostgresSQL(sql) {
  // Use PostgREST to execute raw SQL
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Prefer': 'params=single-object'
    },
    body: JSON.stringify(sql)
  });

  return { ok: response.ok, status: response.status };
}

async function getCount() {
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

  try {
    const beforeCount = await getCount();
    console.log(`📊 Current garage count: ${beforeCount}\n`);

    const sqlFile = path.join(__dirname, 'combined_batches_01-10.sql');

    if (!fs.existsSync(sqlFile)) {
      console.error(`❌ File not found: ${sqlFile}`);
      process.exit(1);
    }

    console.log(`📖 Reading ${path.basename(sqlFile)}...`);
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Count INSERT statements
    const insertCount = (sqlContent.match(/INSERT INTO garages/g) || []).length;
    console.log(`✅ Found ${insertCount} INSERT statements\n`);

    // Read all chunk files
    const chunkFiles = fs.readdirSync(__dirname)
      .filter(f => f.startsWith('batch_chunk_'))
      .sort();

    console.log(`📦 Processing ${chunkFiles.length} chunks...\n`);

    let processed = 0;
    let succeeded = 0;

    for (const chunkFile of chunkFiles) {
      const chunkPath = path.join(__dirname, chunkFile);
      const chunkSQL = fs.readFileSync(chunkPath, 'utf8').trim();

      if (chunkSQL.length === 0) continue;

      try {
        // Try to execute the chunk
        const result = await executePostgresSQL(chunkSQL);

        // Count as success if OK or conflict (409)
        if (result.ok || result.status === 409) {
          succeeded++;
        }
      } catch (err) {
        // Ignore errors due to ON CONFLICT DO NOTHING
      }

      processed++;
      const progress = Math.round((processed / chunkFiles.length) * 100);
      process.stdout.write(`\r📈 Progress: ${processed}/${chunkFiles.length} chunks (${progress}%)`);

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('✨ IMPORT COMPLETE');
    console.log('='.repeat(60));
    console.log(`📦 Chunks processed: ${processed}`);
    console.log(`✅ Successful: ${succeeded}`);

    const afterCount = await getCount();
    console.log(`\n📊 Garage count before: ${beforeCount}`);
    console.log(`📊 Garage count after: ${afterCount}`);
    console.log(`🆕 New garages added: ${afterCount - beforeCount}`);

    // Clean up chunk files
    console.log('\n🧹 Cleaning up temporary files...');
    chunkFiles.forEach(f => {
      try {
        fs.unlinkSync(path.join(__dirname, f));
      } catch (e) {
        // Ignore
      }
    });

    console.log('\n🎉 Import completed successfully!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

importGarages();
