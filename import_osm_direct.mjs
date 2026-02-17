import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

function parseSQLInserts(sql) {
  const garages = [];
  const insertRegex = /INSERT INTO garages[\s\S]*?VALUES\s*\((.*?)\)\s*ON CONFLICT/g;

  let match;
  while ((match = insertRegex.exec(sql)) !== null) {
    const values = match[1];

    // Parse values - this is a simplified parser
    const parts = [];
    let current = '';
    let inString = false;
    let inArray = false;
    let braceCount = 0;

    for (let i = 0; i < values.length; i++) {
      const char = values[i];

      if (char === "'" && values[i - 1] !== '\\') {
        inString = !inString;
        current += char;
      } else if (char === '{' && !inString) {
        braceCount++;
        inArray = true;
        current += char;
      } else if (char === '}' && !inString) {
        braceCount--;
        if (braceCount === 0) inArray = false;
        current += char;
      } else if (char === ',' && !inString && !inArray) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    if (current) parts.push(current.trim());

    if (parts.length >= 24) {
      try {
        const garage = {
          organization_id: parts[0].replace(/'/g, ''),
          name: parts[1].replace(/'/g, ''),
          address_line_1: parts[2].replace(/'/g, ''),
          address_line_2: parts[3].replace(/'/g, ''),
          city: parts[4].replace(/'/g, ''),
          province: parts[5].replace(/'/g, ''),
          postal_code: parts[6].replace(/'/g, ''),
          country: parts[7].replace(/'/g, ''),
          latitude: parseFloat(parts[8]),
          longitude: parseFloat(parts[9]),
          email_address: parts[10] === 'NULL' ? null : parts[10].replace(/'/g, ''),
          contact_persons: JSON.parse(parts[11].replace(/::jsonb$/, '')),
          bank_name: parts[12].replace(/'/g, ''),
          account_holder: parts[13].replace(/'/g, ''),
          account_number: parts[14].replace(/'/g, ''),
          branch_code: parts[15].replace(/'/g, ''),
          vat_number: parts[16].replace(/'/g, ''),
          commission_rate: parseFloat(parts[17]),
          fuel_brand: parts[18].replace(/'/g, ''),
          fuel_types: parts[19].replace(/^'\{/, '{').replace(/\}'$/, '}').replace(/::text\[\]$/, '').split(',').map(f => f.trim().replace(/"/g, '')),
          fuel_prices: JSON.parse(parts[20].replace(/::jsonb$/, '')),
          price_zone: parts[21].replace(/'/g, ''),
          other_offerings: JSON.parse(parts[22].replace(/::jsonb$/, '')),
          status: parts[23].replace(/'/g, '')
        };

        garages.push(garage);
      } catch (e) {
        console.error('Parse error:', e.message);
      }
    }
  }

  return garages;
}

async function main() {
  console.log('Reading SQL files...\n');

  const parts = [1, 2, 3, 4, 5, 6];
  let totalInserted = 0;
  let totalSkipped = 0;

  for (const partNum of parts) {
    const filename = `import_part${partNum}.sql`;
    console.log(`Processing ${filename}...`);

    const sql = fs.readFileSync(filename, 'utf8');
    const garages = parseSQLInserts(sql);

    console.log(`  Parsed ${garages.length} garages`);

    // Insert in batches of 50
    const batchSize = 50;
    for (let i = 0; i < garages.length; i += batchSize) {
      const batch = garages.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('garages')
        .insert(batch)
        .select();

      if (error) {
        if (error.message.includes('duplicate') || error.code === '23505') {
          totalSkipped += batch.length;
        } else {
          console.error(`  Error inserting batch:`, error.message);
        }
      } else {
        totalInserted += (data || batch).length;
      }

      process.stdout.write(`\r  Progress: ${Math.min(i + batchSize, garages.length)}/${garages.length}`);
      await new Promise(r => setTimeout(r, 100));
    }

    console.log(`\n  ✓ Complete\n`);
  }

  console.log('=== Import Complete ===');
  console.log(`Inserted: ${totalInserted}`);
  console.log(`Skipped: ${totalSkipped}`);

  const { count } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });

  console.log(`\nTotal garages in database: ${count}`);
}

main().catch(console.error);
