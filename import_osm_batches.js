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
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const batchesDir = path.join(__dirname, 'sql_batches');

async function executeBatch(filePath, batchNumber, totalBatches) {
  const batchName = path.basename(filePath);
  console.log(`\n[${batchNumber}/${totalBatches}] Executing ${batchName}...`);

  try {
    const sql = fs.readFileSync(filePath, 'utf8');

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error(`  ❌ Error: ${error.message}`);
      return { success: false, error: error.message };
    }

    console.log(`  ✅ Success`);
    return { success: true };
  } catch (error) {
    console.error(`  ❌ Exception: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('Starting OSM garage data import...\n');

  const files = fs.readdirSync(batchesDir)
    .filter(f => f.startsWith('batch_') && f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} batch files to execute\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(batchesDir, files[i]);
    const result = await executeBatch(filePath, i + 1, files.length);

    if (result.success) {
      successCount++;
    } else {
      errorCount++;
      errors.push({ file: files[i], error: result.error });
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(50));
  console.log('IMPORT SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total batches: ${files.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${errorCount}`);

  if (errors.length > 0) {
    console.log('\n❌ Failed batches:');
    errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }

  const { data: garageCount } = await supabase
    .from('garages')
    .select('id', { count: 'exact', head: true });

  if (garageCount !== null) {
    console.log(`\n📊 Total garages in database: ${garageCount}`);
  }

  console.log('\n✅ Import complete!');
}

main().catch(console.error);
