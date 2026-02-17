import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function bulkImportGarages() {
  console.log('🚀 Starting bulk garage import...\n');

  try {
    // Read the SQL file
    const sqlContent = readFileSync('./combined_batches_01-10.sql', 'utf-8');

    console.log('📦 Executing SQL import...');
    console.log('   This may take a few minutes...\n');

    // Execute the entire SQL file
    const { data, error } = await supabase.rpc('exec_sql', {
      query: sqlContent
    });

    if (error) {
      console.error('❌ Import failed:', error.message);
      console.error('\nTrying alternative method...\n');

      // Alternative: Split and import line by line
      await importLineByLine(sqlContent);
    } else {
      console.log('✅ SQL executed successfully!');
    }

    // Check results
    const { count, error: countError } = await supabase
      .from('garages')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting garages:', countError.message);
    } else {
      console.log('\n========================================');
      console.log('📊 IMPORT COMPLETE');
      console.log('========================================');
      console.log(`🎉 Total garages in database: ${count}`);
      console.log('========================================\n');
    }

  } catch (err) {
    console.error('💥 Fatal error:', err.message);
    process.exit(1);
  }
}

async function importLineByLine(sqlContent) {
  console.log('📝 Importing garages one by one...\n');

  // Split into individual INSERT statements
  const statements = sqlContent
    .split(/(?=INSERT INTO garages)/)
    .filter(stmt => stmt.trim().startsWith('INSERT INTO garages'))
    .map(stmt => stmt.trim());

  console.log(`Found ${statements.length} INSERT statements\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    // Extract garage info for logging
    const nameMatch = statement.match(/VALUES \('[\w-]+',\s*'([^']+)'/);
    const cityMatch = statement.match(/'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'South Africa'/);
    const garageName = nameMatch ? nameMatch[1] : 'Unknown';
    const city = cityMatch ? cityMatch[1] : 'Unknown';

    try {
      // Parse and extract values manually since we can't execute raw SQL
      // Let's use a regex to extract the VALUES
      const valuesMatch = statement.match(/VALUES\s*\((.*?)\)\s*ON CONFLICT/s);
      if (!valuesMatch) {
        throw new Error('Could not parse VALUES clause');
      }

      const values = valuesMatch[1];

      // For now, just execute raw SQL using the postgres connection
      // This is a simplified version - you might need to adjust based on your setup
      const { error } = await supabase.rpc('execute_sql', {
        sql: statement
      });

      if (error) {
        errorCount++;
        if (errorCount <= 5) {
          console.log(`❌ ${i + 1}/${statements.length} - ${garageName} (${city}): ${error.message}`);
        }
      } else {
        successCount++;
        if ((i + 1) % 50 === 0) {
          console.log(`✓ Processed ${i + 1}/${statements.length} garages...`);
        }
      }
    } catch (err) {
      errorCount++;
      if (errorCount <= 5) {
        console.log(`❌ ${i + 1}/${statements.length} - ${garageName} (${city}): ${err.message}`);
      }
    }

    // Small delay every 50 inserts
    if ((i + 1) % 50 === 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('\n========================================');
  console.log(`✓ Successful: ${successCount}`);
  console.log(`✗ Errors: ${errorCount}`);
  console.log('========================================\n');
}

bulkImportGarages();
