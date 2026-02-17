import { readFileSync, readdirSync } from 'fs';

const chunks = readdirSync('.')
  .filter(f => f.startsWith('osm_chunk_'))
  .sort();

console.log(`Found ${chunks.length} chunks to process`);
console.log('\nGenerate SQL commands to run:\n');

chunks.forEach((chunk, i) => {
  const sql = readFileSync(chunk, 'utf-8');
  const lines = sql.split('\n').filter(l => l.trim() && !l.trim().startsWith('--'));
  console.log(`-- Chunk ${i+1}/${chunks.length}: ${chunk} (${lines.length} lines)`);
  console.log(`mcp__supabase__execute_sql: ${chunk}`);
  console.log('');
});

console.log('\n\nAlternatively, you can combine all chunks into a single migration:');
console.log('cat osm_chunk_* > final_osm_import.sql');
console.log('Then apply as a Supabase migration');
