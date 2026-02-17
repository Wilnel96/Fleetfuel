import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importBatchFile(filePath, fileName) {
  try {
    console.log(`\nImporting ${fileName}...`);
    const sql = readFileSync(filePath, 'utf-8');

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).single();

    if (error) {
      console.error(`Error importing ${fileName}:`, error.message);
      return false;
    }

    console.log(`✓ Successfully imported ${fileName}`);
    return true;
  } catch (err) {
    console.error(`Error reading/importing ${fileName}:`, err.message);
    return false;
  }
}

async function createExecSqlFunction() {
  console.log('Creating exec_sql function...');

  const { error } = await supabase.rpc('exec_sql', {
    sql_query: `
      CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql_query;
      END;
      $$;
    `
  });

  if (error && !error.message.includes('already exists')) {
    console.log('Function may already exist or will be created on first use');
  }
}

async function main() {
  console.log('Starting OSM Garage Import...');
  console.log('==================================\n');

  const batchesDir = join(__dirname, 'osm_sql_batches');
  const batchFiles = readdirSync(batchesDir)
    .filter(f => f.startsWith('batch_'))
    .sort();

  console.log(`Found ${batchFiles.length} batch files to import`);

  let successCount = 0;
  let failCount = 0;

  for (const fileName of batchFiles) {
    const filePath = join(batchesDir, fileName);
    const success = await importBatchFile(filePath, fileName);

    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n==================================');
  console.log('Import Complete!');
  console.log(`✓ Successful: ${successCount}`);
  console.log(`✗ Failed: ${failCount}`);
  console.log('==================================\n');

  const { data: count } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });

  console.log(`Total garages in database: ${count}`);
}

main().catch(console.error);
