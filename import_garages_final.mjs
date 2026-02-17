import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read all garage batch files
const files = fs.readdirSync(__dirname)
  .filter(f => f.startsWith('garage_batch_'))
  .sort();

console.log(`Found ${files.length} garage batch files`);
console.log('Total INSERT statements:',files.map(f => {
  const content = fs.readFileSync(path.join(__dirname, f), 'utf8');
  return (content.match(/INSERT INTO garages/g) || []).length;
}).reduce((a, b) => a + b, 0));

console.log('\nTo import these garages, use the mcp__supabase__execute_sql tool');
console.log('Execute each file in order:\n');

files.forEach((f, i) => {
  const content = fs.readFileSync(path.join(__dirname, f), 'utf8');
  const insertCount = (content.match(/INSERT INTO garages/g) || []).length;
  console.log(`${i + 1}. ${f} - ${insertCount} garages`);
});
