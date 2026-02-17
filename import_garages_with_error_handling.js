import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importGarages() {
  console.log('Starting garage import...\n');

  // Read the SQL file
  const sqlContent = readFileSync('./combined_batches_01-10.sql', 'utf-8');

  // Split into individual INSERT statements
  const insertStatements = sqlContent
    .split('INSERT INTO garages')
    .filter(stmt => stmt.trim().length > 0)
    .map(stmt => 'INSERT INTO garages' + stmt);

  console.log(`Found ${insertStatements.length} INSERT statements\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  const errors = [];

  // Process in smaller batches
  const batchSize = 10;
  for (let i = 0; i < insertStatements.length; i += batchSize) {
    const batch = insertStatements.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(insertStatements.length / batchSize)} (statements ${i + 1}-${Math.min(i + batchSize, insertStatements.length)})...`);

    for (const statement of batch) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          errorCount++;
          errors.push({
            statement: statement.substring(0, 200) + '...',
            error: error.message
          });
          console.log(`  ❌ Error: ${error.message}`);
        } else {
          successCount++;
          console.log(`  ✓ Success`);
        }
      } catch (err) {
        errorCount++;
        errors.push({
          statement: statement.substring(0, 200) + '...',
          error: err.message
        });
        console.log(`  ❌ Exception: ${err.message}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('');
  }

  // Summary
  console.log('\n========================================');
  console.log('IMPORT SUMMARY');
  console.log('========================================');
  console.log(`✓ Successfully imported: ${successCount}`);
  console.log(`⊘ Skipped (already exists): ${skipCount}`);
  console.log(`✗ Errors: ${errorCount}`);
  console.log('========================================\n');

  if (errors.length > 0) {
    console.log('ERRORS ENCOUNTERED:');
    errors.slice(0, 5).forEach((err, idx) => {
      console.log(`\n${idx + 1}. ${err.error}`);
      console.log(`   Statement: ${err.statement}`);
    });

    if (errors.length > 5) {
      console.log(`\n... and ${errors.length - 5} more errors`);
    }
  }

  // Check final count
  const { count } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });

  console.log(`\nTotal garages in database: ${count}`);
}

importGarages().catch(console.error);
