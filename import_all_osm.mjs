import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function executeSQLFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
      console.error(`Error:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error(`Error:`, err.message);
    return { success: false, error: err.message };
  }
}

async function main() {
  const batchDir = path.join(__dirname, 'osm_sql_batches');
  const files = fs.readdirSync(batchDir)
    .filter(f => f.startsWith('batch_'))
    .sort();

  console.log(`Found ${files.length} batch files to import`);
  console.log('Starting import...\n');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < files.length; i++) {
    const fileName = files[i];
    const filePath = path.join(batchDir, fileName);

    process.stdout.write(`[${i + 1}/${files.length}] ${fileName}... `);

    const result = await executeSQLFile(filePath);

    if (result.success) {
      console.log('✓');
      successCount++;
    } else {
      console.log('✗');
      failCount++;
    }

    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n=== Import Complete ===');
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);

  // Check final count
  const { count, error } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });

  if (!error) {
    console.log(`\nTotal garages in database: ${count}`);
  }
}

main().catch(console.error);
