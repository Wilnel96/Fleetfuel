import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';

const MANAGEMENT_ORG_ID = '00000000-0000-0000-0000-000000000000';

const FUEL_BRAND_MAP = {
  'shell': 'Shell',
  'bp': 'BP',
  'engen': 'Engen',
  'total': 'Total Energies',
  'sasol': 'Sasol',
  'caltex': 'Caltex',
  'exon': 'Exon',
  'puma': 'Puma Energy'
};

async function fetchFuelStationsFromOSM() {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';

  const provinces = [
    { name: 'Gauteng', bbox: '(-29.0,25.0,-25.0,29.0)' },
    { name: 'Western Cape', bbox: '(-35.0,17.5,-31.0,25.0)' },
    { name: 'KwaZulu-Natal', bbox: '(-31.5,28.0,-26.5,33.0)' },
    { name: 'Eastern Cape', bbox: '(-35.0,22.0,-30.0,30.0)' },
    { name: 'Limpopo', bbox: '(-25.5,27.0,-22.0,32.0)' },
    { name: 'Mpumalanga', bbox: '(-27.5,28.5,-24.5,32.0)' },
    { name: 'North West', bbox: '(-28.0,23.0,-24.5,28.0)' },
    { name: 'Free State', bbox: '(-30.0,24.5,-27.0,30.0)' },
    { name: 'Northern Cape', bbox: '(-30.0,17.0,-27.0,25.0)' }
  ];

  console.log('Fetching fuel stations from OpenStreetMap by province...');

  let allElements = [];

  for (const province of provinces) {
    console.log(`Fetching ${province.name}...`);

    const query = `
      [out:json][timeout:60];
      (
        node["amenity"="fuel"]${province.bbox};
        way["amenity"="fuel"]${province.bbox};
        relation["amenity"="fuel"]${province.bbox};
      );
      out center;
    `;

    try {
      const response = await fetch(overpassUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`
      });

      if (!response.ok) {
        console.error(`  HTTP error for ${province.name}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      console.log(`  Found ${data.elements.length} fuel stations in ${province.name}`);
      allElements = allElements.concat(data.elements);

      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`  Error fetching ${province.name}:`, error.message);
      continue;
    }
  }

  console.log(`\nTotal fuel stations found: ${allElements.length}`);
  return allElements;
}

function extractFuelBrand(tags) {
  if (!tags) return '';

  const brandTag = tags.brand || tags.operator || tags.name || '';
  const brandLower = brandTag.toLowerCase();

  for (const [key, value] of Object.entries(FUEL_BRAND_MAP)) {
    if (brandLower.includes(key)) {
      return value;
    }
  }

  return brandTag;
}

function extractFuelTypes(tags) {
  if (!tags) return [];

  const fuelTypes = [];

  if (tags['fuel:diesel'] === 'yes') fuelTypes.push('Diesel');
  if (tags['fuel:octane_93'] === 'yes' || tags['fuel:petrol'] === 'yes') {
    fuelTypes.push('Petrol (93 ULP)');
  }
  if (tags['fuel:octane_95'] === 'yes') fuelTypes.push('Petrol (95 ULP)');
  if (tags['fuel:octane_97'] === 'yes') fuelTypes.push('Petrol (97 ULP)');
  if (tags['fuel:octane_98'] === 'yes') fuelTypes.push('Petrol (98 ULP)');
  if (tags['fuel:lpg'] === 'yes') fuelTypes.push('LPG');
  if (tags['fuel:e85'] === 'yes') fuelTypes.push('E85');

  if (fuelTypes.length === 0) {
    fuelTypes.push('Diesel', 'Petrol (93 ULP)', 'Petrol (95 ULP)');
  }

  return fuelTypes;
}

function extractCity(tags) {
  return tags['addr:city'] ||
         tags['addr:suburb'] ||
         tags['addr:town'] ||
         'Unknown';
}

function extractProvince(tags) {
  const province = tags['addr:province'] || tags['addr:state'] || '';

  const provinceMap = {
    'gauteng': 'Gauteng',
    'western cape': 'Western Cape',
    'eastern cape': 'Eastern Cape',
    'kwazulu-natal': 'KwaZulu-Natal',
    'free state': 'Free State',
    'limpopo': 'Limpopo',
    'mpumalanga': 'Mpumalanga',
    'north west': 'North West',
    'northern cape': 'Northern Cape'
  };

  const provinceLower = province.toLowerCase();
  for (const [key, value] of Object.entries(provinceMap)) {
    if (provinceLower.includes(key)) {
      return value;
    }
  }

  return province || '';
}

function sqlEscape(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function parseGarage(element) {
  const tags = element.tags || {};

  let lat, lon;
  if (element.type === 'node') {
    lat = element.lat;
    lon = element.lon;
  } else if (element.center) {
    lat = element.center.lat;
    lon = element.center.lon;
  }

  const name = tags.name || tags.operator || tags.brand || 'Unknown Fuel Station';
  const city = extractCity(tags);
  const fuelBrand = extractFuelBrand(tags);
  const fuelTypes = extractFuelTypes(tags);
  const province = extractProvince(tags);

  const addressParts = [];
  if (tags['addr:housenumber']) addressParts.push(tags['addr:housenumber']);
  if (tags['addr:street']) addressParts.push(tags['addr:street']);

  const address = addressParts.join(' ') || '';

  const phone = tags.phone || tags['contact:phone'];
  const email = tags.email || tags['contact:email'];

  const contactPersons = [];
  if (phone || email) {
    contactPersons.push({
      name: 'Manager',
      surname: '',
      email: email || '',
      phone: phone || '',
      mobile_phone: '',
      is_primary: true
    });
  }

  return {
    organization_id: MANAGEMENT_ORG_ID,
    name: name,
    address_line_1: address,
    address_line_2: '',
    city: city,
    province: province,
    postal_code: tags['addr:postcode'] || '',
    country: 'South Africa',
    latitude: lat || null,
    longitude: lon || null,
    email_address: email || null,
    contact_persons: JSON.stringify(contactPersons),
    bank_name: 'Unknown Bank',
    account_holder: name,
    account_number: '0000000000',
    branch_code: '000000',
    vat_number: '',
    commission_rate: 0.5,
    fuel_brand: fuelBrand,
    fuel_types: `{${fuelTypes.map(f => `"${f}"`).join(',')}}`,
    fuel_prices: '{}',
    price_zone: '',
    other_offerings: '{}',
    status: 'active'
  };
}

function generateInsertSQL(garage) {
  const lat = garage.latitude !== null ? garage.latitude : 'NULL';
  const lon = garage.longitude !== null ? garage.longitude : 'NULL';
  const email = garage.email_address !== null ? sqlEscape(garage.email_address) : 'NULL';

  return `INSERT INTO garages (organization_id, name, address_line_1, address_line_2, city, province, postal_code, country, latitude, longitude, email_address, contact_persons, bank_name, account_holder, account_number, branch_code, vat_number, commission_rate, fuel_brand, fuel_types, fuel_prices, price_zone, other_offerings, status)
VALUES ('${garage.organization_id}', ${sqlEscape(garage.name)}, ${sqlEscape(garage.address_line_1)}, ${sqlEscape(garage.address_line_2)}, ${sqlEscape(garage.city)}, ${sqlEscape(garage.province)}, ${sqlEscape(garage.postal_code)}, ${sqlEscape(garage.country)}, ${lat}, ${lon}, ${email}, '${garage.contact_persons}'::jsonb, ${sqlEscape(garage.bank_name)}, ${sqlEscape(garage.account_holder)}, ${sqlEscape(garage.account_number)}, ${sqlEscape(garage.branch_code)}, ${sqlEscape(garage.vat_number)}, ${garage.commission_rate}, ${sqlEscape(garage.fuel_brand)}, '${garage.fuel_types}'::text[], '{}'::jsonb, ${sqlEscape(garage.price_zone)}, '{}'::jsonb, ${sqlEscape(garage.status)})
ON CONFLICT DO NOTHING;`;
}

async function main() {
  try {
    console.log('Starting OSM fuel station import...\n');

    const osmElements = await fetchFuelStationsFromOSM();

    const garages = osmElements
      .filter(element => {
        const tags = element.tags || {};
        return tags.name || tags.operator || tags.brand;
      })
      .map(element => parseGarage(element));

    console.log(`\nParsed ${garages.length} valid garages with names`);

    console.log('\nGenerating SQL...');

    const sqlStatements = garages.map(generateInsertSQL);

    const fullSQL = `-- Import OSM Fuel Stations
-- Generated: ${new Date().toISOString()}
-- Total garages: ${garages.length}

${sqlStatements.join('\n\n')}
`;

    fs.writeFileSync('osm_garages_insert.sql', fullSQL);

    console.log(`\nSQL file generated: osm_garages_insert.sql`);
    console.log(`Total INSERT statements: ${sqlStatements.length}`);

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
