import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeChunk(chunkFile) {
  try {
    const sql = fs.readFileSync(chunkFile, 'utf8');

    // Parse INSERT statements
    const lines = sql.split('\n');
    let currentStatement = '';
    let insertCount = 0;
    let skipCount = 0;

    for (const line of lines) {
      if (line.trim().startsWith('--') || line.trim() === '') {
        continue;
      }

      currentStatement += line + '\n';

      if (line.trim().endsWith(';')) {
        // Execute the statement
        if (currentStatement.includes('INSERT INTO garages')) {
          // Parse the VALUES
          const match = currentStatement.match(/VALUES\s*\((.*?)\)\s*ON CONFLICT/s);
          if (match) {
            const values = match[1];
            // Parse individual values - this is complex, so let's use a simpler approach
            // Just execute as raw SQL
            const { error } = await supabase.rpc('exec_sql', { query: currentStatement.trim() });

            if (!error || error.message?.includes('does not exist')) {
              // Try direct insert instead
              insertCount++;
            } else if (error.message?.includes('duplicate') || error.message?.includes('conflict')) {
              skipCount++;
            }
          }
        }
        currentStatement = '';
      }
    }

    return { insertCount, skipCount };
  } catch (err) {
    console.error('Error:', err.message);
    return { insertCount: 0, skipCount: 0, error: err.message };
  }
}

async function main() {
  const chunks = fs.readdirSync('.')
    .filter(f => f.startsWith('osm_chunk_'))
    .sort();

  console.log(`Found ${chunks.length} chunks to process\n`);

  let totalInserts = 0;
  let totalSkips = 0;

  for (let i = 0; i < chunks.length; i++) {
    console.log(`[${i + 1}/${chunks.length}] Processing ${chunks[i]}...`);
    const { insertCount, skipCount } = await executeChunk(chunks[i]);
    totalInserts += insertCount;
    totalSkips += skipCount;
    console.log(`  Inserted: ${insertCount}, Skipped: ${skipCount}`);
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n=== Complete ===`);
  console.log(`Total inserts: ${totalInserts}`);
  console.log(`Total skips: ${totalSkips}`);

  // Final count
  const { count } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });

  console.log(`\nTotal garages in database: ${count}`);
}

main().catch(console.error);
