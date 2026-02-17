import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function importChunk(fileName, index, total) {
  try {
    console.log(`[${index}/${total}] Importing ${fileName}...`);
    const sql = readFileSync(fileName, 'utf-8');

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error(`  ✗ Error: ${error.message}`);
      return false;
    }

    console.log(`  ✓ Success`);
    return true;
  } catch (err) {
    console.error(`  ✗ Error: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('\n===========================================');
  console.log('   OSM Garage Import - MyFuelApp');
  console.log('===========================================\n');

  const { count: initialCount } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });

  console.log(`Initial garage count: ${initialCount}\n`);

  const chunkFiles = readdirSync('.')
    .filter(f => f.startsWith('osm_chunk_'))
    .sort();

  console.log(`Found ${chunkFiles.length} chunks to import\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < chunkFiles.length; i++) {
    const success = await importChunk(chunkFiles[i], i + 1, chunkFiles.length);

    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    if ((i + 1) % 5 === 0) {
      const { count } = await supabase
        .from('garages')
        .select('*', { count: 'exact', head: true });
      console.log(`\n  Progress: ${count} total garages\n`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const { count: finalCount } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });

  console.log('\n===========================================');
  console.log('          Import Complete!');
  console.log('===========================================');
  console.log(`✓ Successful: ${successCount}`);
  console.log(`✗ Failed: ${failCount}`);
  console.log(`\nInitial: ${initialCount}`);
  console.log(`Final: ${finalCount}`);
  console.log(`Added: ${finalCount - initialCount}`);
  console.log('===========================================\n');
}

main().catch(console.error);
