import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importBatch(batchFile) {
  try {
    const sql = fs.readFileSync(batchFile, 'utf8');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error(`Error importing ${path.basename(batchFile)}:`, error.message);
      return false;
    }

    console.log(`✓ Imported ${path.basename(batchFile)}`);
    return true;
  } catch (err) {
    console.error(`Error reading ${path.basename(batchFile)}:`, err.message);
    return false;
  }
}

async function main() {
  const batchDir = path.join(__dirname, 'osm_sql_batches');
  const files = fs.readdirSync(batchDir)
    .filter(f => f.startsWith('batch_'))
    .sort()
    .map(f => path.join(batchDir, f));

  console.log(`Found ${files.length} batch files to import`);
  console.log('Starting import...\n');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < files.length; i++) {
    console.log(`[${i + 1}/${files.length}] Processing ${path.basename(files[i])}...`);
    const success = await importBatch(files[i]);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n=== Import Complete ===');
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);

  // Check total count
  const { data: countData, error: countError } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });

  if (!countError) {
    console.log(`\nTotal garages in database: ${countData || 0}`);
  }
}

main().catch(console.error);
