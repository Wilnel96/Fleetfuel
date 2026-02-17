import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importGaragesFromSQL() {
  try {
    const sqlFile = path.join(__dirname, 'combined_batches_01-10.sql');

    if (!fs.existsSync(sqlFile)) {
      console.error(`SQL file not found: ${sqlFile}`);
      process.exit(1);
    }

    console.log('Reading SQL file...');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    console.log('Executing SQL import...');
    console.log('This may take a few minutes for large files...\n');

    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    });

    if (error) {
      console.error('Error executing SQL:', error);

      // If rpc method doesn't exist, try direct execution
      console.log('\nTrying direct execution method...');

      // Split into individual INSERT statements
      const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.toUpperCase().includes('INSERT'));

      console.log(`Found ${statements.length} INSERT statements`);

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < statements.length; i++) {
        try {
          const { error: insertError } = await supabase.rpc('exec_sql', {
            sql_query: statements[i] + ';'
          });

          if (!insertError) {
            successCount++;
            if ((i + 1) % 100 === 0) {
              console.log(`Processed ${i + 1}/${statements.length} statements...`);
            }
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }

      console.log(`\nImport completed:`);
      console.log(`- Successful: ${successCount}`);
      console.log(`- Errors: ${errorCount}`);
    } else {
      console.log('Import completed successfully!');
    }

    // Verify the import
    const { data: garageCount, error: countError } = await supabase
      .from('garages')
      .select('id', { count: 'exact', head: true });

    if (!countError) {
      console.log(`\nTotal garages in database: ${garageCount}`);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

importGaragesFromSQL();
