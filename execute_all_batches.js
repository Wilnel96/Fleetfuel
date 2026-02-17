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

// We'll use fetch to execute raw SQL via PostgREST
const batchesDir = path.join(__dirname, 'sql_batches');

async function executeBatchFile(filePath, batchNum, total) {
  const fileName = path.basename(filePath);
  process.stdout.write(`[${batchNum}/${total}] ${fileName}... `);

  try {
    const sql = fs.readFileSync(filePath, 'utf8');

    // Count inserts
    const insertCount = (sql.match(/INSERT INTO/g) || []).length;

    // Execute via direct SQL - using the database connection string pattern
    // Since we don't have the connection string, we'll use a workaround
    // by executing via the RPC endpoint if available

    console.log(`✅ ${insertCount} statements ready (execution pending)`);
    return { success: true, count: insertCount, sql };
  } catch (error) {
    console.log(`❌ ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('Preparing SQL batches for execution...\n');

  const files = fs.readdirSync(batchesDir)
    .filter(f => f.startsWith('batch_') && f.endsWith('.sql'))
    .sort()
    .map(f => path.join(batchesDir, f));

  console.log(`Found ${files.length} batch files\n`);

  const allSQL = [];
  let totalStatements = 0;

  for (let i = 0; i < files.length; i++) {
    const result = await executeBatchFile(files[i], i + 1, files.length);
    if (result.success && result.sql) {
      allSQL.push(result.sql);
      totalStatements += result.count || 0;
    }
  }

  // Write combined SQL file
  const combinedPath = path.join(__dirname, 'all_batches_combined.sql');
  fs.writeFileSync(combinedPath, allSQL.join('\n\n'));

  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total batch files: ${files.length}`);
  console.log(`Total INSERT statements: ${totalStatements}`);
  console.log(`Combined SQL saved to: all_batches_combined.sql`);
  console.log('\nYou can execute this via Supabase SQL Editor or psql');
}

main().catch(console.error);
