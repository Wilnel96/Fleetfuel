import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables:');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'present' : 'MISSING');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'present' : 'MISSING');
  process.exit(1);
}

console.log('Using Supabase URL:', supabaseUrl);
console.log('Using API key (first 20 chars):', supabaseKey?.substring(0, 20));

const supabase = createClient(supabaseUrl, supabaseKey);

const MANAGEMENT_ORG_NAME = 'FUEL EMPOWERMENT SYSTEMS (PTY) LTD';
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

const FUEL_TYPE_MAP = {
  'diesel': 'Diesel',
  'petrol': 'Petrol (93 ULP)',
  'lpg': 'LPG',
  'e85': 'E85',
  'octane_95': 'Petrol (95 ULP)',
  'octane_97': 'Petrol (97 ULP)',
  'octane_98': 'Petrol (98 ULP)'
};

async function fetchManagementOrganization() {
  return MANAGEMENT_ORG_ID;
}

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

function parseGarage(element, managementOrgId) {
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
    organization_id: managementOrgId,
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
    contact_persons: contactPersons,
    bank_name: 'Unknown Bank',
    account_holder: name,
    account_number: '0000000000',
    branch_code: '000000',
    vat_number: '',
    commission_rate: 0.5,
    fuel_brand: fuelBrand,
    fuel_types: fuelTypes,
    fuel_prices: {},
    price_zone: '',
    other_offerings: {},
    status: 'active'
  };
}

async function checkExistingGarage(name, latitude, longitude) {
  if (!latitude || !longitude) {
    const { data, error } = await supabase
      .from('garages')
      .select('id, name')
      .eq('name', name)
      .maybeSingle();

    return data;
  }

  const { data, error } = await supabase
    .from('garages')
    .select('id, name, latitude, longitude')
    .eq('name', name);

  if (error || !data) return null;

  for (const garage of data) {
    if (garage.latitude && garage.longitude) {
      const distance = calculateDistance(
        latitude, longitude,
        parseFloat(garage.latitude), parseFloat(garage.longitude)
      );

      if (distance < 0.1) {
        return garage;
      }
    }
  }

  return null;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function insertGarages(garages) {
  console.log(`\nProcessing ${garages.length} garages...`);

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const garage of garages) {
    try {
      const existing = await checkExistingGarage(
        garage.name,
        garage.latitude,
        garage.longitude
      );

      if (existing) {
        console.log(`Skipping: ${garage.name} (already exists)`);
        skipped++;
        continue;
      }

      const { data, error } = await supabase
        .from('garages')
        .insert([garage])
        .select();

      if (error) {
        console.error(`Error inserting ${garage.name}:`, error.message);
        errors++;
      } else {
        console.log(`Inserted: ${garage.name} in ${garage.city}`);
        inserted++;
      }

      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`Exception inserting ${garage.name}:`, error.message);
      errors++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total processed: ${garages.length}`);
}

async function main() {
  try {
    console.log('Starting OSM fuel station import...\n');

    const managementOrgId = await fetchManagementOrganization();
    console.log(`Management Organization ID: ${managementOrgId}\n`);

    const osmElements = await fetchFuelStationsFromOSM();

    const garages = osmElements
      .filter(element => {
        const tags = element.tags || {};
        return tags.name || tags.operator || tags.brand;
      })
      .map(element => parseGarage(element, managementOrgId));

    console.log(`Parsed ${garages.length} valid garages with names`);

    await insertGarages(garages);

    console.log('\nImport complete!');

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
