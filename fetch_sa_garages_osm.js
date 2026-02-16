/**
 * Fetch real South African garage data from OpenStreetMap (FREE)
 * Uses Overpass API to query OSM data
 *
 * No API key needed - completely free!
 * Run: node fetch_sa_garages_osm.js
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// South African province boundaries (approximate bounding boxes)
const SA_PROVINCES = [
  { name: 'Gauteng', province: 'Gauteng', zone: 'Inland', bbox: [27.0, -26.5, 29.0, -25.0] },
  { name: 'Western Cape', province: 'Western Cape', zone: 'Coastal', bbox: [18.0, -34.5, 23.0, -31.0] },
  { name: 'KwaZulu-Natal', province: 'KwaZulu-Natal', zone: 'Coastal', bbox: [28.5, -31.0, 32.5, -27.0] },
  { name: 'Eastern Cape', province: 'Eastern Cape', zone: 'Coastal', bbox: [22.5, -34.0, 30.0, -30.5] },
  { name: 'Free State', province: 'Free State', zone: 'Inland', bbox: [24.0, -30.0, 29.5, -27.0] },
  { name: 'Limpopo', province: 'Limpopo', zone: 'Inland', bbox: [27.0, -25.5, 32.0, -22.0] },
  { name: 'Mpumalanga', province: 'Mpumalanga', zone: 'Inland', bbox: [28.5, -27.0, 32.0, -24.5] },
  { name: 'Northern Cape', province: 'Northern Cape', zone: 'Inland', bbox: [16.5, -32.0, 25.0, -26.5] },
  { name: 'North West', province: 'North West', zone: 'Inland', bbox: [23.0, -28.0, 28.0, -24.5] },
];

async function queryOverpass(province) {
  const [minLon, minLat, maxLon, maxLat] = province.bbox;

  // Overpass QL query for fuel stations
  const query = `
    [out:json][timeout:60];
    (
      node["amenity"="fuel"](${minLat},${minLon},${maxLat},${maxLon});
      way["amenity"="fuel"](${minLat},${minLon},${maxLat},${maxLon});
    );
    out center;
  `;

  const url = 'https://overpass-api.de/api/interpreter';

  try {
    console.log(`Querying ${province.name}...`);

    const response = await fetch(url, {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'text/plain' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.elements || [];
  } catch (error) {
    console.error(`❌ Error querying ${province.name}:`, error.message);
    return [];
  }
}

function detectFuelBrand(tags) {
  const name = (tags.name || '').toLowerCase();
  const brand = (tags.brand || '').toLowerCase();
  const operator = (tags.operator || '').toLowerCase();

  const searchText = `${name} ${brand} ${operator}`;

  if (searchText.includes('shell')) return 'Shell';
  if (searchText.includes('bp')) return 'BP';
  if (searchText.includes('engen')) return 'Engen';
  if (searchText.includes('sasol')) return 'Sasol';
  if (searchText.includes('total')) return 'Total';
  if (searchText.includes('caltex')) return 'Caltex';

  return tags.brand || tags.operator || 'Unknown';
}

function extractAddress(tags) {
  const street = tags['addr:street'] || '';
  const houseNumber = tags['addr:housenumber'] || '';
  const suburb = tags['addr:suburb'] || '';
  const city = tags['addr:city'] || suburb;
  const postalCode = tags['addr:postcode'] || '';

  let address = '';
  if (houseNumber && street) {
    address = `${houseNumber} ${street}`;
  } else if (street) {
    address = street;
  }

  return {
    address: address || tags.name || 'Address not available',
    city: city || 'Unknown',
    postal_code: postalCode
  };
}

async function fetchAllGarages() {
  console.log('🔍 Fetching South African garage data from OpenStreetMap...\n');
  console.log('This is FREE and uses community-contributed data.\n');

  const allGarages = [];

  for (const province of SA_PROVINCES) {
    const elements = await queryOverpass(province);
    console.log(`  ${province.name}: Found ${elements.length} fuel stations`);

    for (const element of elements) {
      const tags = element.tags || {};

      // Get coordinates (handle both nodes and ways)
      const lat = element.lat || (element.center && element.center.lat);
      const lon = element.lon || (element.center && element.center.lon);

      if (!lat || !lon) continue;

      const addressData = extractAddress(tags);
      const fuelBrand = detectFuelBrand(tags);

      const garage = {
        name: tags.name || `${fuelBrand} Station`,
        address: addressData.address,
        city: addressData.city,
        province: province.province,
        postal_code: addressData.postal_code,
        latitude: lat,
        longitude: lon,
        fuel_brand: fuelBrand,
        price_zone: province.zone,
        phone: tags.phone || tags['contact:phone'] || null,
        website: tags.website || tags['contact:website'] || null,
        opening_hours: tags.opening_hours || null
      };

      allGarages.push(garage);
    }

    // Be nice to the free API - wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n✅ Total garages found: ${allGarages.length}`);

  // Remove duplicates by name+coordinates
  const uniqueGarages = Array.from(
    new Map(allGarages.map(g => [`${g.name}_${g.latitude}_${g.longitude}`, g])).values()
  );

  console.log(`✅ Unique garages: ${uniqueGarages.length}`);

  return uniqueGarages;
}

function convertToCSV(garages) {
  const headers = [
    'name', 'address', 'address_line_2', 'city', 'province', 'postal_code',
    'latitude', 'longitude', 'phone', 'email', 'fuel_brand', 'price_zone',
    'available_fuel_types', 'fuel_prices_petrol_95', 'fuel_prices_petrol_93',
    'fuel_prices_diesel_50ppm', 'fuel_prices_diesel_500ppm', 'other_offerings',
    'contact_1_name', 'contact_1_surname', 'contact_1_email',
    'contact_1_office_phone', 'contact_1_mobile_phone',
    'contact_2_name', 'contact_2_surname', 'contact_2_email',
    'contact_2_office_phone', 'contact_2_mobile_phone',
    'vat_number', 'bank_name', 'account_holder', 'account_number', 'branch_code'
  ];

  const rows = [headers.join(',')];

  for (const garage of garages) {
    // Default fuel types for SA garages
    const fuel_types = 'Petrol 95|Diesel 50ppm';

    const row = [
      `"${garage.name.replace(/"/g, '""')}"`,
      `"${garage.address.replace(/"/g, '""')}"`,
      '', // address_line_2
      `"${garage.city.replace(/"/g, '""')}"`,
      `"${garage.province}"`,
      garage.postal_code || '',
      garage.latitude,
      garage.longitude,
      garage.phone || '',
      '', // email - not available from OSM
      garage.fuel_brand,
      garage.price_zone,
      fuel_types,
      '', '', '', '', // fuel prices - need manual update
      'Convenience Store', // Default offering
      '', '', '', '', '', // contact_1
      '', '', '', '', '', // contact_2
      '', '', '', '', '' // banking
    ];

    rows.push(row.join(','));
  }

  return rows.join('\n');
}

async function main() {
  try {
    const garages = await fetchAllGarages();

    if (garages.length === 0) {
      console.log('\n⚠️  No garages found. This might be a temporary API issue.');
      return;
    }

    // Save to CSV
    const csv = convertToCSV(garages);
    const outputPath = join(__dirname, 'garage_import_data_osm.csv');
    fs.writeFileSync(outputPath, csv, 'utf-8');

    console.log(`\n✅ Saved ${garages.length} garages to: garage_import_data_osm.csv`);
    console.log('\n📋 Data Quality Notes:');
    console.log('- OpenStreetMap data quality varies by region');
    console.log('- Some garage names may be missing or incomplete');
    console.log('- You should verify and clean the data before importing');
    console.log('\nNext steps:');
    console.log('1. Review and clean the CSV file');
    console.log('2. Add missing names and correct any errors');
    console.log('3. Add fuel prices (from current SA fuel price sources)');
    console.log('4. Add contact information if available');
    console.log('5. Rename file to: garage_import_template.csv');
    console.log('6. Run: node import_garages_from_csv.js');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
