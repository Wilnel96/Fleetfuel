#!/usr/bin/env node

/**
 * Converts OSM-style SQL INSERT statements to the correct format for MyFuelApp database
 *
 * Usage: node convert_osm_sql_to_correct_format.js input.sql
 */

import { readFileSync, writeFileSync } from 'fs';

function convertSQL(inputFile) {
  console.log('Reading SQL file...');
  const content = readFileSync(inputFile, 'utf-8');

  // Extract INSERT statements
  const insertPattern = /INSERT INTO garages \([^)]+\)\s*VALUES \(([^;]+)\)\s*ON CONFLICT DO NOTHING;/g;

  let match;
  const convertedStatements = [];
  let count = 0;

  while ((match = insertPattern.exec(content)) !== null) {
    count++;
    const valuesStr = match[1];

    // Parse the values (this is a simplified parser)
    // Extract: org_id, name, address_line_1, address_line_2, city, province, postal_code, country, lat, lng, email, contacts, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status

    const values = parseValues(valuesStr);

    if (values && values.name) {
      const sql = generateCorrectSQL(values);
      convertedStatements.push(sql);
    }
  }

  console.log(`Converted ${count} INSERT statements`);

  const outputFile = inputFile.replace('.sql', '_converted.sql');
  writeFileSync(outputFile, convertedStatements.join('\n\n'), 'utf-8');

  console.log(`✅ Converted SQL saved to: ${outputFile}`);
  console.log(`\nYou can now run this SQL in Supabase SQL Editor`);
}

function parseValues(valuesStr) {
  // This is a simplified parser - it splits by commas but needs to handle quotes and arrays
  const parts = [];
  let current = '';
  let inString = false;
  let inArray = false;
  let depth = 0;

  for (let i = 0; i < valuesStr.length; i++) {
    const char = valuesStr[i];
    const nextChar = valuesStr[i + 1];

    if (char === "'" && valuesStr[i - 1] !== '\\') {
      inString = !inString;
      current += char;
    } else if (char === '{' && !inString) {
      inArray = true;
      depth++;
      current += char;
    } else if (char === '}' && !inString) {
      depth--;
      if (depth === 0) inArray = false;
      current += char;
    } else if (char === ',' && !inString && !inArray && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  // Map to object
  const cleanValue = (val) => {
    val = val.trim();
    if (val === 'NULL' || val === '') return null;
    if (val.startsWith("'") && val.endsWith("'")) {
      return val.slice(1, -1).replace(/''/g, "'");
    }
    return val;
  };

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
    contact_persons: parts[11]?.trim() || '[]',
    bank_name: cleanValue(parts[12]),
    account_holder: cleanValue(parts[13]),
    account_number: cleanValue(parts[14]),
    branch_code: cleanValue(parts[15]),
    vat_number: cleanValue(parts[16]),
    commission_rate: cleanValue(parts[17]) || '0.5',
    fuel_brand: cleanValue(parts[18]),
    fuel_types: parts[19]?.trim() || "'{}'",
    fuel_prices: parts[20]?.trim() || "'{}'",
    price_zone: cleanValue(parts[21]) || 'coastal',
    other_offerings: parts[22]?.trim() || "'{}'",
    status: cleanValue(parts[23]) || 'active'
  };
}

function escapeSql(str) {
  if (!str) return null;
  return str.replace(/'/g, "''");
}

function generateCorrectSQL(values) {
  const name = escapeSql(values.name);

  return `DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM garages WHERE name = '${name}') THEN
    INSERT INTO garages (
      organization_id, name, email_address, address_line_1, address_line_2,
      city, province, postal_code, latitude, longitude,
      fuel_types, fuel_brand, price_zone, other_offerings,
      vat_number, password, status, contact_persons
    ) VALUES (
      (SELECT id FROM organizations WHERE organization_type = 'management' LIMIT 1),
      '${name}',
      ${values.email_address ? `'${escapeSql(values.email_address)}'` : 'NULL'},
      ${values.address_line_1 ? `'${escapeSql(values.address_line_1)}'` : 'NULL'},
      ${values.address_line_2 ? `'${escapeSql(values.address_line_2)}'` : 'NULL'},
      ${values.city ? `'${escapeSql(values.city)}'` : "'Unknown'"},
      ${values.province ? `'${escapeSql(values.province)}'` : "'Western Cape'"},
      ${values.postal_code ? `'${escapeSql(values.postal_code)}'` : 'NULL'},
      ${values.latitude || 'NULL'},
      ${values.longitude || 'NULL'},
      ${values.fuel_types}::text[],
      '${escapeSql(values.fuel_brand) || 'Independent'}',
      '${escapeSql(values.price_zone) || 'coastal'}',
      ${values.other_offerings}::jsonb,
      ${values.vat_number ? `'${escapeSql(values.vat_number)}'` : 'NULL'},
      'garage123',
      '${values.status || 'active'}',
      ${values.contact_persons}::jsonb
    );
  END IF;
END $$;`;
}

// Run
const inputFile = process.argv[2];

if (!inputFile) {
  console.error('Usage: node convert_osm_sql_to_correct_format.js input.sql');
  process.exit(1);
}

try {
  convertSQL(inputFile);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
