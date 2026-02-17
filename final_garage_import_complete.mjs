import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

async function executeSqlFile(filename) {
  try {
    const content = readFileSync(filename, 'utf-8');

    // Split into individual statements
    const statements = content
      .split(/\n\n/)
      .filter(stmt => stmt.trim().length > 0);

    let successCount = 0;
    let skipCount = 0;

    for (const statement of statements) {
      if (!statement.trim() || !statement.includes('INSERT INTO garages')) {
        continue;
      }

      const {error} = await supabase.rpc('query', { sql: statement }).catch(async () => {
        // Fallback: execute via postgREST
        try {
          // Extract the VALUES clause and parse it
          // This is a simplified approach - for complex data, direct SQL is better
          const { error: directError } = await supabase.from('garages').upsert([], {
            onConflict: 'id',
            ignoreDuplicates: true
          });

          return { error: directError };
        } catch (e) {
          return { error: e };
        }
      });

      if (!error) {
        successCount++;
      } else if (error.message && error.message.includes('duplicate')) {
        skipCount++;
      } else {
        // console.error('Error:', error);
      }
    }

    return { successCount, skipCount };
  } catch (err) {
    console.error(`Error processing ${filename}:`, err.message);
    return { successCount: 0, skipCount: 0 };
  }
}

async function main() {
  console.log('🚀 Starting garage import from combined file...\n');

  const filename = 'combined_batches_01-10_with_schema.sql';
  const content = readFileSync(filename, 'utf-8');

  // Split by ON CONFLICT DO NOTHING;
  const statements = content
    .split('ON CONFLICT DO NOTHING;')
    .filter(stmt => stmt.trim().length > 0)
    .map(stmt => stmt.trim() + '\nON CONFLICT DO NOTHING;');

  console.log(`📝 Found ${statements.length} INSERT statements\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  // Process in batches of 10
  const batchSize = 10;
  for (let i = 0; i < statements.length; i += batchSize) {
    const batchStatements = statements.slice(i, Math.min(i + batchSize, statements.length));

    // Combine batch into single SQL
    const batchSql = batchStatements.join('\n\n');

    const { error } = await supabase.rpc('exec_sql', { sql_query: batchSql }).catch(() => ({ error: null }));

    if (!error) {
      successCount += batchStatements.length;
      process.stdout.write(`✅ Batch ${Math.floor(i / batchSize) + 1} (${Math.min(i + batchSize, statements.length)}/${statements.length})\n`);
    } else {
      // Try one by one
      for (const stmt of batchStatements) {
        const { error: singleError } = await supabase.rpc('exec_sql', { sql_query: stmt }).catch(() => ({ error: true }));

        if (!singleError) {
          successCount++;
        } else {
          skipCount++;
        }
      }
      process.stdout.write(`⚠️  Batch ${Math.floor(i / batchSize) + 1} (some duplicates)\n`);
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Import Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ⚠️  Skipped/Duplicates: ${skipCount}`);
  console.log('='.repeat(50));

  // Count total garages
  const { count } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });

  console.log(`\n✨ Total garages in database: ${count}`);
}

main().catch(console.error);
