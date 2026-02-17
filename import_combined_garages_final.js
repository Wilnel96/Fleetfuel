import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Parse a single INSERT statement and extract the values
function parseInsertStatement(sql) {
  // Extract the VALUES clause
  const valuesMatch = sql.match(/VALUES\s*\((.*?)\)\s*ON CONFLICT/s);
  if (!valuesMatch) return null;

  const valuesStr = valuesMatch[1];

  // This is a simplified parser - for production use a proper SQL parser
  // Split by commas but respect nested structures
  const values = [];
  let current = '';
  let depth = 0;
  let inString = false;
  let stringChar = null;
  let escaped = false;

  for (let i = 0; i < valuesStr.length; i++) {
    const char = valuesStr[i];
    const prevChar = i > 0 ? valuesStr[i - 1] : '';

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      current += char;
      continue;
    }

    if ((char === "'" || char === '"') && !inString) {
      inString = true;
      stringChar = char;
      current += char;
    } else if (char === stringChar && inString && prevChar !== '\\') {
      // Check if it's an escaped quote (two quotes together)
      if (valuesStr[i + 1] === stringChar) {
        current += char + stringChar;
        i++; // Skip next quote
      } else {
        inString = false;
        stringChar = null;
        current += char;
      }
    } else if (!inString) {
      if (char === '[' || char === '{' || char === '(') {
        depth++;
        current += char;
      } else if (char === ']' || char === '}' || char === ')') {
        depth--;
        current += char;
      } else if (char === ',' && depth === 0) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    values.push(current.trim());
  }

  // Parse each value
  const parsedValues = values.map(v => {
    v = v.trim();

    // NULL
    if (v === 'NULL') return null;

    // UUID
    if (v.match(/^'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'$/i)) {
      return v.slice(1, -1);
    }

    // String
    if (v.startsWith("'") && v.endsWith("'")) {
      return v.slice(1, -1).replace(/''/g, "'");
    }

    // JSONB
    if (v.endsWith('::jsonb')) {
      const jsonStr = v.replace(/::jsonb$/, '').trim();
      if (jsonStr.startsWith("'") && jsonStr.endsWith("'")) {
        return JSON.parse(jsonStr.slice(1, -1));
      }
      return JSON.parse(jsonStr);
    }

    // Array
    if (v.endsWith('::text[]')) {
      const arrayStr = v.replace(/::text\[\]$/, '').trim();
      if (arrayStr.startsWith("'{") && arrayStr.endsWith("}'")) {
        const items = arrayStr.slice(2, -2).split(',');
        return items.map(item => item.replace(/^"(.*)"$/, '$1'));
      }
      return [];
    }

    // Number
    if (v.match(/^-?\d+(\.\d+)?$/)) {
      return parseFloat(v);
    }

    // Default: return as string
    return v;
  });

  // Map to column names
  const columns = [
    'organization_id', 'name', 'address_line_1', 'address_line_2', 'city',
    'province', 'postal_code', 'country', 'latitude', 'longitude',
    'email_address', 'contact_persons', 'bank_name', 'account_holder',
    'account_number', 'branch_code', 'vat_number', 'commission_rate',
    'fuel_brand', 'fuel_types', 'fuel_prices', 'price_zone',
    'other_offerings', 'status'
  ];

  const garage = {};
  columns.forEach((col, i) => {
    if (i < parsedValues.length) {
      garage[col] = parsedValues[i];
    }
  });

  return garage;
}

async function importGarages() {
  try {
    console.log('🚀 Starting garage import...\n');

    // Check current count
    let beforeCount = 0;
    try {
      const { count, error: countError } = await supabase
        .from('garages')
        .select('id', { count: 'exact', head: true });

      if (!countError) {
        beforeCount = count || 0;
      }
    } catch (e) {
      // Ignore count error and continue
    }

    console.log(`📊 Current garage count: ${beforeCount}\n`);

    // Read SQL file
    const sqlFile = path.join(__dirname, 'combined_batches_01-10.sql');

    if (!fs.existsSync(sqlFile)) {
      console.error(`❌ File not found: ${sqlFile}`);
      process.exit(1);
    }

    console.log(`📖 Reading ${path.basename(sqlFile)}...`);
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Extract INSERT statements
    const insertPattern = /INSERT INTO garages[^;]+;/gs;
    const statements = sqlContent.match(insertPattern) || [];

    console.log(`✅ Found ${statements.length} INSERT statements\n`);

    if (statements.length === 0) {
      console.error('❌ No INSERT statements found');
      process.exit(1);
    }

    console.log('🔄 Parsing and importing garages...\n');

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    // Process in batches
    const batchSize = 10;

    for (let i = 0; i < statements.length; i += batchSize) {
      const batch = statements.slice(i, Math.min(i + batchSize, statements.length));
      const garages = [];

      // Parse each statement in the batch
      for (const statement of batch) {
        try {
          const garage = parseInsertStatement(statement);
          if (garage) {
            garages.push(garage);
          }
        } catch (err) {
          errors++;
        }
      }

      // Insert batch
      if (garages.length > 0) {
        const { error: insertError } = await supabase
          .from('garages')
          .upsert(garages, {
            onConflict: 'id',
            ignoreDuplicates: true
          });

        if (insertError) {
          console.error(`\n❌ Batch error at ${i}: ${insertError.message}`);
          errors += garages.length;
        } else {
          imported += garages.length;
        }
      }

      // Progress update
      const progress = Math.round(((i + batch.length) / statements.length) * 100);
      process.stdout.write(`\r📈 Progress: ${i + batch.length}/${statements.length} (${progress}%)`);

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('✨ IMPORT COMPLETE');
    console.log('='.repeat(60));
    console.log(`📝 Total statements: ${statements.length}`);
    console.log(`✅ Successfully imported: ${imported}`);
    console.log(`⏭️  Skipped (duplicates): ${skipped}`);
    console.log(`❌ Errors: ${errors}`);

    // Check final count
    let afterCount = 0;
    try {
      const { count, error: countError } = await supabase
        .from('garages')
        .select('id', { count: 'exact', head: true });

      if (!countError) {
        afterCount = count || 0;
      }
    } catch (e) {
      // Ignore count error
    }

    console.log(`\n📊 Garage count before: ${beforeCount || 0}`);
    console.log(`📊 Garage count after: ${afterCount || 0}`);
    console.log(`🆕 New garages added: ${(afterCount || 0) - (beforeCount || 0)}`);
    console.log('\n🎉 Import completed successfully!');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

importGarages();
