import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL(sql) {
  const { data, error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) throw error;
  return data;
}

async function main() {
  const files = fs.readdirSync('.')
    .filter(f => f.startsWith('osm_import_'))
    .sort();

  console.log(`Found ${files.length} import files`);
  console.log('Starting import...\n');

  let totalProcessed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`[${i + 1}/${files.length}] Processing ${file}...`);

    try {
      const sql = fs.readFileSync(file, 'utf8');
      await executeSQL(sql);

      const insertCount = (sql.match(/INSERT INTO garages/g) || []).length;
      totalProcessed += insertCount;
      console.log(`  ✓ Inserted ${insertCount} garages (Total: ${totalProcessed})`);
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
    }

    // Delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n=== Import Complete ===');
  console.log(`Total processed: ${totalProcessed}`);

  // Check final count
  const { count } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });

  console.log(`Total garages in database: ${count}`);
}

main().catch(console.error);
