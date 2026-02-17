import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  console.log('\n========================================');
  console.log('  Importing 2,925 OSM Garages');
  console.log('========================================\n');

  const { count: initialCount } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });

  console.log(`Current garages: ${initialCount}\n`);

  const sql = readFileSync('all_osm_garages_combined.sql', 'utf-8');

  const batchSize = 100;
  const statements = sql
    .split('\n')
    .filter(line => line.includes('INSERT INTO garages'));

  console.log(`Total INSERT statements: ${statements.length}\n`);

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i += batchSize) {
    const batch = statements.slice(i, i + batchSize);
    const batchSQL = batch.join('\n') + '\n' + 'ON CONFLICT DO NOTHING;'.repeat(batch.length);

    try {
      await supabase.rpc('exec_sql', { sql_query: batchSQL });
      imported += batch.length;

      if ((i + batchSize) % 500 === 0) {
        const { count } = await supabase
          .from('garages')
          .select('*', { count: 'exact', head: true });
        console.log(`Progress: ${i + batchSize}/${statements.length} | Total in DB: ${count}`);
      }
    } catch (err) {
      console.error(`Batch ${i}-${i + batch.length} failed:`, err.message.substring(0, 100));
      failed += batch.length;
    }

    await new Promise(resolve => setTimeout(resolve, 50));
  }

  const { count: finalCount } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });

  console.log('\n========================================');
  console.log('  Import Complete!');
  console.log('========================================');
  console.log(`Initial: ${initialCount}`);
  console.log(`Final: ${finalCount}`);
  console.log(`Added: ${finalCount - initialCount}`);
  console.log(`Processed: ${imported}`);
  console.log(`Failed: ${failed}`);
  console.log('========================================\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
