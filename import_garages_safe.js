import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Parse a single INSERT statement into a garage object
function parseInsertStatement(statement) {
  try {
    // Extract VALUES clause
    const valuesMatch = statement.match(/VALUES\s*\((.*?)\)\s*ON CONFLICT/s);
    if (!valuesMatch) return null;

    const values = valuesMatch[1];

    // This is a simplified parser - for production, you'd want a more robust solution
    // For now, let's use the execute_sql approach with better error handling
    return statement;
  } catch (err) {
    console.error('Parse error:', err.message);
    return null;
  }
}

async function importGarages() {
  console.log('🚀 Starting garage import with detailed error tracking...\n');

  // Read the SQL file
  const sqlContent = readFileSync('./combined_batches_01-10.sql', 'utf-8');

  // Split into individual INSERT statements
  const insertStatements = sqlContent
    .split(/(?=INSERT INTO garages)/)
    .filter(stmt => stmt.trim().startsWith('INSERT INTO garages'));

  console.log(`📦 Found ${insertStatements.length} INSERT statements\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  // Process each statement individually with detailed error tracking
  for (let i = 0; i < insertStatements.length; i++) {
    const statement = insertStatements[i].trim();

    // Extract garage name for better logging
    const nameMatch = statement.match(/VALUES \('[\w-]+',\s*'([^']+)'/);
    const garageName = nameMatch ? nameMatch[1] : `Statement ${i + 1}`;

    try {
      // Execute the SQL directly
      const { data, error } = await supabase.rpc('exec_raw_sql', {
        sql_query: statement
      });

      if (error) {
        errorCount++;
        errors.push({
          index: i + 1,
          name: garageName,
          error: error.message,
          statement: statement.substring(0, 150) + '...'
        });
        console.log(`  ❌ ${i + 1}/${insertStatements.length} - ${garageName}: ${error.message}`);
      } else {
        successCount++;
        if ((i + 1) % 10 === 0 || i === insertStatements.length - 1) {
          console.log(`  ✓ ${i + 1}/${insertStatements.length} - ${garageName}`);
        }
      }
    } catch (err) {
      errorCount++;
      errors.push({
        index: i + 1,
        name: garageName,
        error: err.message,
        statement: statement.substring(0, 150) + '...'
      });
      console.log(`  ❌ ${i + 1}/${insertStatements.length} - ${garageName}: ${err.message}`);
    }

    // Small delay to avoid overwhelming the database
    if ((i + 1) % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Summary
  console.log('\n========================================');
  console.log('📊 IMPORT SUMMARY');
  console.log('========================================');
  console.log(`✓ Successfully imported: ${successCount}`);
  console.log(`✗ Errors: ${errorCount}`);
  console.log('========================================\n');

  if (errors.length > 0) {
    console.log('⚠️  ERRORS ENCOUNTERED:\n');
    errors.slice(0, 10).forEach((err) => {
      console.log(`${err.index}. ${err.name}`);
      console.log(`   Error: ${err.error}\n`);
    });

    if (errors.length > 10) {
      console.log(`... and ${errors.length - 10} more errors\n`);
    }

    // Save full error log to file
    const errorLog = errors.map(e =>
      `${e.index}. ${e.name}\nError: ${e.error}\nStatement: ${e.statement}\n\n`
    ).join('');

    writeFileSync('./garage_import_errors.log', errorLog);
    console.log('📝 Full error log saved to: garage_import_errors.log\n');
  }

  // Check final count
  const { count } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });

  console.log(`\n🎉 Total garages in database: ${count}`);
}

importGarages().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(1);
});
