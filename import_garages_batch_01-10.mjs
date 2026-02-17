import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function importGarages() {
  console.log('🚀 Starting garage import from combined_batches_01-10_with_schema.sql...\n');

  try {
    // Read the SQL file
    const sqlContent = readFileSync('./combined_batches_01-10_with_schema.sql', 'utf-8');

    console.log('📁 File loaded successfully');
    console.log(`📊 File size: ${(sqlContent.length / 1024).toFixed(2)} KB\n`);

    // Execute the SQL directly
    console.log('⚡ Executing SQL import...');

    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    });

    if (error) {
      console.error('❌ Error executing SQL:', error);

      // If the RPC function doesn't exist, try splitting into individual statements
      console.log('\n🔄 Trying alternative approach: parsing and executing individual statements...\n');

      // Split into individual INSERT statements
      const statements = sqlContent
        .split('ON CONFLICT DO NOTHING;')
        .filter(stmt => stmt.trim().length > 0)
        .map(stmt => stmt.trim() + '\nON CONFLICT DO NOTHING;');

      console.log(`📝 Found ${statements.length} INSERT statements\n`);

      let successCount = 0;
      let errorCount = 0;
      let skipCount = 0;

      // Execute in batches of 50
      const batchSize = 50;
      for (let i = 0; i < statements.length; i += batchSize) {
        const batch = statements.slice(i, i + batchSize);
        const batchSql = batch.join('\n\n');

        const { error: batchError } = await supabase.rpc('exec_sql', {
          sql_query: batchSql
        }).catch(async () => {
          // If RPC still doesn't work, use raw SQL execution
          return await supabase.from('garages').insert(
            batch.map(parseInsertStatement).filter(Boolean)
          );
        });

        if (batchError) {
          console.log(`⚠️  Batch ${Math.floor(i / batchSize) + 1} had errors (likely duplicates)`);
          errorCount += batch.length;
        } else {
          successCount += batch.length;
          console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} completed (${i + batch.length}/${statements.length})`);
        }
      }

      console.log('\n' + '='.repeat(50));
      console.log('📊 Import Summary:');
      console.log(`   ✅ Successful: ${successCount}`);
      console.log(`   ⚠️  Skipped/Errors: ${errorCount}`);
      console.log('='.repeat(50));

    } else {
      console.log('✅ SQL executed successfully!');
      console.log(data);
    }

    // Verify the import
    const { count, error: countError } = await supabase
      .from('garages')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting garages:', countError);
    } else {
      console.log(`\n✨ Total garages in database: ${count}`);
    }

  } catch (err) {
    console.error('💥 Fatal error:', err);
  }
}

function parseInsertStatement(sql) {
  // This is a simplified parser - would need to be more robust for production
  try {
    const match = sql.match(/VALUES \((.*?)\)/s);
    if (!match) return null;

    // This is complex - would need proper SQL parsing
    // For now, just return null and let the SQL execution handle it
    return null;
  } catch {
    return null;
  }
}

importGarages();
