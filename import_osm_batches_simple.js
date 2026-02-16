import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const batchesDir = path.join(__dirname, 'sql_batches');

function main() {
  const files = fs.readdirSync(batchesDir)
    .filter(f => f.startsWith('batch_') && f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} batch files\n`);
  console.log('You can execute these batches in one of three ways:\n');

  console.log('METHOD 1: Using Supabase Dashboard SQL Editor');
  console.log('-'.repeat(50));
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste each batch file content');
  console.log('4. Click "Run" to execute\n');

  console.log('METHOD 2: Using the files directly');
  console.log('-'.repeat(50));
  console.log('Batch files are located in: sql_batches/');
  files.slice(0, 5).forEach(file => {
    console.log(`  - ${file}`);
  });
  console.log(`  ... and ${files.length - 5} more\n`);

  console.log('METHOD 3: View a sample batch');
  console.log('-'.repeat(50));
  const firstBatch = path.join(batchesDir, files[0]);
  const sample = fs.readFileSync(firstBatch, 'utf8');
  const lines = sample.split('\n');
  console.log(`First 15 lines of ${files[0]}:\n`);
  console.log(lines.slice(0, 15).join('\n'));
  console.log('\n... (file continues)');

  console.log('\n' + '='.repeat(50));
  console.log(`Total: ${files.length} batches ready to import`);
  console.log('='.repeat(50));
}

main();
