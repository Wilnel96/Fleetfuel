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

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function executeSQLFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const { error } = await supabase.rpc('exec_sql', { query: sql });
  return error;
}

async function main() {
  const parts = [1, 2, 3, 4, 5, 6];

  console.log('Starting OSM garage import...\n');

  let totalImported = 0;
  const startCount = await supabase.from('garages').select('*', { count: 'exact', head: true });

  for (const partNum of parts) {
    const filename = `import_part${partNum}.sql`;
    const insertCount = (fs.readFileSync(filename, 'utf8').match(/INSERT INTO garages/g) || []).length;

    process.stdout.write(`Part ${partNum}/6 (${insertCount} garages)... `);

    const error = await executeSQLFile(filename);

    if (error) {
      console.log(`✗ Error: ${error.message}`);
      if (error.message.includes('does not exist')) {
        console.log('Note: exec_sql function not found, using direct insert...');

        // Fallback: parse and insert individually
        const sql = fs.readFileSync(filename, 'utf8');
        const lines = sql.split('\n');
        let inserted = 0;

        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('INSERT INTO garages')) {
            // Collect multi-line INSERT statement
            let statement = '';
            for (let j = i; j < lines.length && !statement.includes('ON CONFLICT'); j++) {
              statement += lines[i] + '\n';
              i = j;
            }

            const { error: insertError } = await supabase.rpc('exec_sql', { query: statement });
            if (!insertError) inserted++;
          }
        }

        console.log(`Inserted ${inserted} garages via fallback method`);
        totalImported += inserted;
      }
    } else {
      console.log('✓');
      totalImported += insertCount;
    }

    await new Promise(r => setTimeout(r, 1000));
  }

  const endCount = await supabase.from('garages').select('*', { count: 'exact', head: true  });

  console.log(`\n=== Import Complete ===`);
  console.log(`Before: ${startCount.count || 0} garages`);
  console.log(`After: ${endCount.count || 0} garages`);
  console.log(`New garages added: ${(endCount.count || 0) - (startCount.count || 0)}`);
}

main().catch(console.error);
