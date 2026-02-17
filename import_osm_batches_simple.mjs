import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials!');
  console.error('URL:', supabaseUrl ? '✓' : '✗');
  console.error('Key:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function importBatchFile(filePath, fileName, index, total) {
  try {
    const sql = readFileSync(filePath, 'utf-8');

    const lines = sql.split('\n').filter(line =>
      line.trim() &&
      !line.trim().startsWith('--') &&
      line.includes('INSERT INTO garages')
    );

    const insertCount = lines.length;
    console.log(`[${index}/${total}] Importing ${fileName} (${insertCount} garages)...`);

    const statements = sql.split(';').filter(s => s.trim());

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (!stmt || stmt.startsWith('--')) continue;

      const { error } = await supabase.rpc('exec', {
        query: stmt + ';'
      });

      if (error) {
        const match = stmt.match(/VALUES \('00000000-0000-0000-0000-000000000000', '([^']+)'/);
        const garageName = match ? match[1] : 'Unknown';

        if (!error.message.includes('already exists') &&
            !error.message.includes('duplicate key') &&
            !error.message.includes('does not exist')) {
          console.error(`  ⚠ Error on garage "${garageName}":`, error.message.substring(0, 100));
        }
      }
    }

    console.log(`  ✓ Completed ${fileName}`);
    return true;
  } catch (err) {
    console.error(`  ✗ Error with ${fileName}:`, err.message);
    return false;
  }
}

async function main() {
  console.log('\n===========================================');
  console.log('   OSM Garage Import - MyFuelApp');
  console.log('===========================================\n');
  console.log(`Connected to: ${supabaseUrl}\n`);

  const { data: initialCount } = await supabase
    .from('garages')
    .select('id', { count: 'exact', head: true });

  console.log(`Initial garage count: ${initialCount || 0}\n`);

  const batchesDir = join(__dirname, 'osm_sql_batches');
  const batchFiles = readdirSync(batchesDir)
    .filter(f => f.startsWith('batch_'))
    .sort();

  console.log(`Found ${batchFiles.length} batch files\n`);
  console.log('Starting import...\n');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < batchFiles.length; i++) {
    const fileName = batchFiles[i];
    const filePath = join(batchesDir, fileName);
    const success = await importBatchFile(filePath, fileName, i + 1, batchFiles.length);

    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    if ((i + 1) % 10 === 0) {
      const { data: currentCount } = await supabase
        .from('garages')
        .select('id', { count: 'exact', head: true });
      console.log(`\n  Progress: ${currentCount || 0} garages imported\n`);
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const { data: finalCount } = await supabase
    .from('garages')
    .select('id', { count: 'exact', head: true });

  console.log('\n===========================================');
  console.log('          Import Complete!');
  console.log('===========================================');
  console.log(`✓ Successful batches: ${successCount}`);
  console.log(`✗ Failed batches: ${failCount}`);
  console.log(`\nInitial count: ${initialCount || 0}`);
  console.log(`Final count: ${finalCount || 0}`);
  console.log(`New garages: ${(finalCount || 0) - (initialCount || 0)}`);
  console.log('===========================================\n');
}

main().catch(err => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
