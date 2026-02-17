import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

function parseGarageFromSQL(insertStatement) {
  const valuesMatch = insertStatement.match(/VALUES\s*\((.*?)\)\s*ON CONFLICT/s);
  if (!valuesMatch) return null;

  const values = valuesMatch[1];

  const parts = [];
  let current = '';
  let inQuote = false;
  let inArray = false;
  let inJson = false;
  let depth = 0;

  for (let i = 0; i < values.length; i++) {
    const char = values[i];
    const nextChar = values[i + 1];

    if (char === "'" && (i === 0 || values[i - 1] !== '\\')) {
      if (values[i - 1] === "'") {
        current += char;
      } else {
        inQuote = !inQuote;
        current += char;
      }
    } else if (!inQuote) {
      if (char === '{') {
        inArray = true;
        depth++;
        current += char;
      } else if (char === '}') {
        depth--;
        if (depth === 0) inArray = false;
        current += char;
      } else if (char === '[') {
        inJson = true;
        depth++;
        current += char;
      } else if (char === ']') {
        depth--;
        if (depth === 0) inJson = false;
        current += char;
      } else if (char === ',' && !inArray && !inJson && depth === 0) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  function cleanValue(val) {
    val = val.trim();
    if (val === 'NULL') return null;
    if (val.startsWith("'") && val.endsWith("'")) {
      return val.slice(1, -1).replace(/''/g, "'");
    }
    if (val.endsWith("::text[]")) {
      const arrayContent = val.slice(0, -8).trim();
      if (arrayContent.startsWith("'{") && arrayContent.endsWith("}'")) {
        const items = arrayContent.slice(2, -2).split(',');
        return items.map(item => item.trim().replace(/^"|"$/g, ''));
      }
      return [];
    }
    if (val.endsWith("::jsonb")) {
      const jsonContent = val.slice(0, -7).trim();
      if (jsonContent.startsWith("'") && jsonContent.endsWith("'")) {
        return JSON.parse(jsonContent.slice(1, -1));
      }
      return JSON.parse(jsonContent);
    }
    if (!isNaN(val)) return parseFloat(val);
    return val;
  }

  return {
    organization_id: cleanValue(parts[0]),
    name: cleanValue(parts[1]),
    address_line_1: cleanValue(parts[2]),
    address_line_2: cleanValue(parts[3]),
    city: cleanValue(parts[4]),
    province: cleanValue(parts[5]),
    postal_code: cleanValue(parts[6]),
    country: cleanValue(parts[7]),
    latitude: cleanValue(parts[8]),
    longitude: cleanValue(parts[9]),
    email_address: cleanValue(parts[10]),
    contact_persons: cleanValue(parts[11]),
    bank_name: cleanValue(parts[12]),
    account_holder: cleanValue(parts[13]),
    account_number: cleanValue(parts[14]),
    branch_code: cleanValue(parts[15]),
    vat_number: cleanValue(parts[16]),
    commission_rate: cleanValue(parts[17]),
    fuel_brand: cleanValue(parts[18]),
    fuel_types: cleanValue(parts[19]),
    fuel_prices: cleanValue(parts[20]),
    price_zone: cleanValue(parts[21]),
    other_offerings: cleanValue(parts[22]),
    status: cleanValue(parts[23])
  };
}

async function importBatchFile(filePath, fileName, index, total) {
  try {
    const sql = readFileSync(filePath, 'utf-8');
    const insertStatements = sql.split(/INSERT INTO garages/).slice(1);

    console.log(`[${index}/${total}] ${fileName} - ${insertStatements.length} garages`);

    let imported = 0;
    let skipped = 0;

    for (const stmt of insertStatements) {
      try {
        const garage = parseGarageFromSQL(stmt);
        if (!garage) continue;

        const { error } = await supabase
          .from('garages')
          .insert(garage);

        if (error) {
          if (error.message.includes('duplicate') || error.code === '23505') {
            skipped++;
          } else {
            console.error(`  ⚠ ${garage.name}:`, error.message.substring(0, 80));
          }
        } else {
          imported++;
        }
      } catch (err) {
        console.error(`  ⚠ Parse error:`, err.message.substring(0, 80));
      }
    }

    console.log(`  ✓ Imported: ${imported}, Skipped: ${skipped}`);
    return true;
  } catch (err) {
    console.error(`  ✗ ${fileName}:`, err.message);
    return false;
  }
}

async function main() {
  console.log('\n===========================================');
  console.log('   OSM Garage Import - MyFuelApp');
  console.log('===========================================\n');

  const { count: initialCount } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });

  console.log(`Initial garage count: ${initialCount}\n`);

  const batchesDir = join(__dirname, 'osm_sql_batches');
  const batchFiles = readdirSync(batchesDir)
    .filter(f => f.startsWith('batch_'))
    .sort();

  console.log(`Found ${batchFiles.length} batch files\n`);

  for (let i = 0; i < batchFiles.length; i++) {
    const fileName = batchFiles[i];
    const filePath = join(batchesDir, fileName);
    await importBatchFile(filePath, fileName, i + 1, batchFiles.length);

    if ((i + 1) % 20 === 0) {
      const { count } = await supabase
        .from('garages')
        .select('*', { count: 'exact', head: true });
      console.log(`\n  Progress: ${count} total garages\n`);
    }
  }

  const { count: finalCount } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });

  console.log('\n===========================================');
  console.log('          Import Complete!');
  console.log('===========================================');
  console.log(`Initial: ${initialCount}`);
  console.log(`Final: ${finalCount}`);
  console.log(`Added: ${finalCount - initialCount}`);
  console.log('===========================================\n');
}

main().catch(console.error);
