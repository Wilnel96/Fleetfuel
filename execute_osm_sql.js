import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sqlFile = path.join(__dirname, 'osm_garages_insert.sql');

console.log('Reading SQL file...');
const fullSQL = fs.readFileSync(sqlFile, 'utf8');

const insertStatements = fullSQL
  .split('ON CONFLICT DO NOTHING;')
  .map(s => s.trim())
  .filter(s => s.startsWith('INSERT'))
  .map(s => s + '\nON CONFLICT DO NOTHING;');

console.log(`Found ${insertStatements.length} INSERT statements`);

const batchSize = 50;
const batches = [];

for (let i = 0; i < insertStatements.length; i += batchSize) {
  const batch = insertStatements.slice(i, i + batchSize);
  batches.push(batch.join('\n\n'));
}

console.log(`Created ${batches.length} batches of up to ${batchSize} statements each`);

const outputDir = path.join(__dirname, 'sql_batches');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

batches.forEach((batch, index) => {
  const filename = path.join(outputDir, `batch_${String(index + 1).padStart(4, '0')}.sql`);
  fs.writeFileSync(filename, batch);
});

console.log(`\nBatches written to ${outputDir}/`);
console.log(`You can now execute each batch using the Supabase MCP tool`);
console.log(`\nExample: Execute batch_0001.sql, batch_0002.sql, etc.`);
