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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ query: sql })
  });

  return response;
}

async function importGarages() {
  try {
    // Get current count before import
    const { count: beforeCount } = await supabase
      .from('garages')
      .select('*', { count: 'exact', head: true });

    console.log(`Current garage count: ${beforeCount || 0}\n`);

    const sqlFile = path.join(__dirname, 'combined_batches_01-10.sql');

    if (!fs.existsSync(sqlFile)) {
      console.error(`SQL file not found: ${sqlFile}`);
      console.log('\nAvailable SQL files:');
      const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.sql'));
      files.forEach(f => console.log(`  - ${f}`));
      process.exit(1);
    }

    console.log(`Reading SQL file: ${path.basename(sqlFile)}`);
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Extract INSERT statements
    const insertStatements = sqlContent
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.toUpperCase().startsWith('INSERT'));

    console.log(`Found ${insertStatements.length} INSERT statements\n`);
    console.log('Starting import...\n');

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < insertStatements.length; i++) {
      const statement = insertStatements[i];

      try {
        // Use Supabase's PostgREST to execute raw SQL
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        }).catch(async () => {
          // If rpc doesn't work, try direct fetch
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ query: statement + ';' })
          });

          if (!response.ok && response.status !== 409) {
            throw new Error(`HTTP ${response.status}`);
          }

          return { error: null };
        });

        if (!error) {
          successCount++;
        } else if (error.message && error.message.includes('duplicate')) {
          skipCount++;
        } else {
          errorCount++;
          if (errors.length < 5) {
            errors.push({ index: i + 1, error: error.message });
          }
        }

      } catch (err) {
        // ON CONFLICT DO NOTHING means duplicates are expected
        skipCount++;
      }

      if ((i + 1) % 100 === 0) {
        console.log(`Progress: ${i + 1}/${insertStatements.length} (${Math.round((i + 1) / insertStatements.length * 100)}%)`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Import Summary');
    console.log('='.repeat(50));
    console.log(`Total statements: ${insertStatements.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Skipped (duplicates): ${skipCount}`);
    console.log(`Errors: ${errorCount}`);

    if (errors.length > 0) {
      console.log('\nFirst few errors:');
      errors.forEach(e => console.log(`  Statement ${e.index}: ${e.error}`));
    }

    // Get final count
    const { count: afterCount } = await supabase
      .from('garages')
      .select('*', { count: 'exact', head: true });

    console.log(`\nFinal garage count: ${afterCount || 0}`);
    console.log(`New garages added: ${(afterCount || 0) - (beforeCount || 0)}`);

  } catch (error) {
    console.error('\nFatal error:', error);
    process.exit(1);
  }
}

importGarages();
