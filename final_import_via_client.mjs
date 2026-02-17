import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('VITE_SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 Importing all 500 garages from combined file...\n');
console.log(`📡 Connected to: ${supabaseUrl}\n`);

try {
  // Read the complete SQL file
  const sqlContent = readFileSync('combined_batches_01-10_with_schema.sql', 'utf-8');

  //Split into individual INSERT statements
  const statements = sqlContent
    .split('ON CONFLICT DO NOTHING;')
    .filter(stmt => stmt.trim().includes('INSERT INTO garages'))
    .map(stmt => stmt.trim() + '\nON CONFLICT DO NOTHING;');

  console.log(`📝 Found ${statements.length} INSERT statements to process\n`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  // Process in batches of 10
  const batchSize = 10;
  for (let i = 0; i < statements.length; i += batchSize) {
    const batch = statements.slice(i, Math.min(i + batchSize, statements.length));

    for (const stmt of batch) {
      try {
        // Execute via raw SQL using PostgREST
        const { error } = await supabase.rpc('query', { sql: stmt });

        if (error) {
          // Likely a duplicate, which is fine
          if (error.message && (error.message.includes('duplicate') || error.message.includes('not found'))) {
            skipped++;
          } else {
            errors++;
          }
        } else {
          imported++;
        }
      } catch (err) {
        // Silent skip for duplicates
        skipped++;
      }
    }

    // Progress update
    if ((i + batchSize) % 100 === 0 || i + batchSize >= statements.length) {
      const processed = Math.min(i + batchSize, statements.length);
      process.stdout.write(`\r📊 Progress: ${processed}/${statements.length} processed...`);
    }
  }

  console.log('\n\n' + '='.repeat(50));
  console.log('✅ Import completed!');
  console.log(`   Imported: ${imported}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
  console.log('='.repeat(50));

  // Final count
  const { count, error: countError } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });

  if (!countError) {
    console.log(`\n✨ Total garages in database: ${count}/500\n`);

    if (count === 500) {
      console.log('🎉 All garages successfully imported!\n');
    } else if (count < 500) {
      console.log(`⚠️  ${500 - count} garages still need to be imported.\n`);
    }
  }

} catch (error) {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
}
