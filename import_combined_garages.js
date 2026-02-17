import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

async function importGarages() {
  console.log('Starting garage import...\n');

  // Check current count
  const { count: beforeCount, error: countError } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error checking current garage count:', countError);
    process.exit(1);
  }

  console.log(`Current garage count: ${beforeCount || 0}\n`);

  // Read the combined SQL file
  const sqlFile = path.join(__dirname, 'combined_batches_01-10.sql');

  if (!fs.existsSync(sqlFile)) {
    console.error(`File not found: ${sqlFile}`);
    process.exit(1);
  }

  console.log(`Reading ${path.basename(sqlFile)}...`);
  const sqlContent = fs.readFileSync(sqlFile, 'utf8');

  // Split into individual INSERT statements
  const statements = sqlContent
    .split(/;\s*[\r\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.toUpperCase().includes('INSERT INTO'));

  console.log(`Found ${statements.length} INSERT statements\n`);

  if (statements.length === 0) {
    console.error('No INSERT statements found in SQL file');
    process.exit(1);
  }

  console.log('Importing garages...\n');

  let processed = 0;
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  // Process in batches to avoid timeouts
  const batchSize = 50;

  for (let i = 0; i < statements.length; i += batchSize) {
    const batch = statements.slice(i, Math.min(i + batchSize, statements.length));
    const batchSql = batch.join(';\n') + ';';

    try {
      // Execute batch using raw SQL query
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'params=single-object'
        },
        body: JSON.stringify({ sql: batchSql })
      });

      if (response.ok || response.status === 409) {
        // Success or conflict (duplicate) - both are acceptable
        processed += batch.length;
        inserted += batch.length;
      } else {
        // Try individual statements in this batch
        for (const statement of batch) {
          try {
            const singleResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Prefer': 'params=single-object'
              },
              body: JSON.stringify({ sql: statement + ';' })
            });

            if (singleResponse.ok || singleResponse.status === 409) {
              inserted++;
            } else {
              skipped++;
            }
            processed++;
          } catch (err) {
            skipped++;
            processed++;
          }
        }
      }

    } catch (err) {
      errors += batch.length;
      processed += batch.length;
    }

    // Progress update
    const progress = Math.round((processed / statements.length) * 100);
    process.stdout.write(`\rProgress: ${processed}/${statements.length} (${progress}%)`);
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('IMPORT COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total statements processed: ${processed}`);
  console.log(`Successfully inserted: ${inserted}`);
  console.log(`Skipped (duplicates/errors): ${skipped + errors}`);

  // Check final count
  const { count: afterCount } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });

  console.log(`\nGarage count before: ${beforeCount || 0}`);
  console.log(`Garage count after: ${afterCount || 0}`);
  console.log(`New garages added: ${(afterCount || 0) - (beforeCount || 0)}`);
  console.log('\n✅ Import completed successfully!');
}

importGarages().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
