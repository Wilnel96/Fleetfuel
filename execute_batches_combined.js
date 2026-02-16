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

async function executeCombinedBatches(batchFiles, groupNum, totalGroups) {
  console.log(`\n[${groupNum}/${totalGroups}] Executing batches ${batchFiles[0]} to ${batchFiles[batchFiles.length - 1]}...`);

  try {
    let combinedSQL = '';
    for (const file of batchFiles) {
      const filePath = path.join(batchesDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      combinedSQL += sql + '\n';
    }

    const { error } = await supabase.rpc('exec_sql', { sql_query: combinedSQL });

    if (error) {
      console.error(`  ❌ Error: ${error.message}`);
      return { success: false, error: error.message };
    }

    console.log(`  ✅ Success - ${batchFiles.length} files executed`);
    return { success: true };
  } catch (error) {
    console.error(`  ❌ Exception: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('Starting OSM garage data import (combined batches)...\n');

  const files = fs.readdirSync(batchesDir)
    .filter(f => f.startsWith('batch_') && f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} batch files\n`);

  const batchSize = 5;
  const groups = [];

  for (let i = 0; i < files.length; i += batchSize) {
    groups.push(files.slice(i, i + batchSize));
  }

  console.log(`Executing in ${groups.length} groups of up to ${batchSize} files each\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < groups.length; i++) {
    const result = await executeCombinedBatches(groups[i], i + 1, groups.length);

    if (result.success) {
      successCount += groups[i].length;
    } else {
      errorCount += groups[i].length;
      errors.push({ group: i + 1, files: groups[i], error: result.error });
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(50));
  console.log('IMPORT SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total batches: ${files.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${errorCount}`);

  if (errors.length > 0) {
    console.log('\n❌ Failed groups:');
    errors.forEach(({ group, files, error }) => {
      console.log(`  - Group ${group} (${files[0]} - ${files[files.length - 1]}): ${error}`);
    });
  }

  console.log('\n✅ Import complete!');
}

main().catch(console.error);
