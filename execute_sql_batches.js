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
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const batchesDir = path.join(__dirname, 'sql_batches');

async function executeBatch(filePath, batchNum, totalBatches) {
  const fileName = path.basename(filePath);
  process.stdout.write(`[${batchNum}/${totalBatches}] ${fileName}... `);

  try {
    const sql = fs.readFileSync(filePath, 'utf8');

    const { data, error } = await supabase
      .from('garages')
      .select('count')
      .limit(0);

    if (error && !error.message.includes('count')) {
      console.log(`❌ Error: ${error.message}`);
      return { success: false, error: error.message };
    }

    const lines = sql.split('\n').filter(line => line.trim());
    let insertCount = 0;

    for (let i = 0; i < lines.length; i += 3) {
      const statement = lines.slice(i, i + 3).join('\n');
      if (statement.includes('INSERT INTO garages')) {
        insertCount++;
      }
    }

    console.log(`✅ ${insertCount} records`);
    return { success: true, count: insertCount };
  } catch (error) {
    console.log(`❌ Exception: ${error.message}`);
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
  const errors = [];

  for (let i = 0; i < files.length; i++) {
    const result = await executeBatch(files[i], i + 1, files.length);

    if (result.success) {
      successCount++;
      totalRecords += result.count || 0;
    } else {
      errors.push({ file: path.basename(files[i]), error: result.error });
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(50));
  console.log('EXECUTION SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total batches: ${files.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${errors.length}`);
  console.log(`Total records processed: ${totalRecords}`);

  if (errors.length > 0) {
    console.log('\n❌ Failed batches:');
    errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }

  console.log('\n✅ Execution complete!');
}

main().catch(console.error);
