import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function executeSQL(sql) {
  try {
    // Split into individual INSERT statements
    const statements = sql
      .split('INSERT INTO garages')
      .filter(s => s.trim().length > 0)
      .map(s => 'INSERT INTO garages' + s);

    let successCount = 0;
    let skipCount = 0;

    for (const statement of statements) {
      const cleanSQL = statement.replace(/;$/, '').trim();
      if (!cleanSQL) continue;

      const { error } = await supabase.rpc('exec_sql', { query: cleanSQL });

      if (error) {
        // Check if it's a duplicate (which is fine)
        if (error.message && (error.message.includes('duplicate') || error.message.includes('conflict'))) {
          skipCount++;
        } else {
          console.error('SQL Error:', error.message);
        }
      } else {
        successCount++;
      }
    }

    return { successCount, skipCount };
  } catch (err) {
    console.error('Execution error:', err.message);
    return { successCount: 0, skipCount: 0, error: err.message };
  }
}

async function main() {
  const chunkFiles = fs.readdirSync('/tmp')
    .filter(f => f.startsWith('osm_chunk_'))
    .sort()
    .map(f => path.join('/tmp', f));

  console.log(`Found ${chunkFiles.length} chunk files to import`);
  console.log('Starting import...\n');

  let totalSuccess = 0;
  let totalSkipped = 0;

  for (let i = 0; i < chunkFiles.length; i++) {
    const chunkFile = chunkFiles[i];
    console.log(`[${i + 1}/${chunkFiles.length}] Processing ${path.basename(chunkFile)}...`);

    const sql = fs.readFileSync(chunkFile, 'utf8');
    const { successCount, skipCount } = await executeSQL(sql);

    totalSuccess += successCount;
    totalSkipped += skipCount;

    console.log(`  ✓ Inserted: ${successCount}, Skipped: ${skipCount}`);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n=== Import Complete ===');
  console.log(`Total inserted: ${totalSuccess}`);
  console.log(`Total skipped: ${totalSkipped}`);

  // Check final count
  const { count, error } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });

  if (!error) {
    console.log(`\nTotal garages in database: ${count}`);
  }
}

main().catch(console.error);
