/**
 * Fetch real South African garage data from Google Places API
 *
 * SETUP:
 * 1. Get a Google Places API key: https://console.cloud.google.com/google/maps-apis
 * 2. Enable Places API
 * 3. Add your API key to .env as GOOGLE_PLACES_API_KEY
 * 4. Run: node fetch_sa_garages_google.js
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variables
const envPath = join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const GOOGLE_API_KEY = envVars.GOOGLE_PLACES_API_KEY;

if (!GOOGLE_API_KEY) {
  console.error('❌ Missing GOOGLE_PLACES_API_KEY in .env file');
  console.log('\nTo get started:');
  console.log('1. Go to: https://console.cloud.google.com/google/maps-apis');
  console.log('2. Enable Places API');
  console.log('3. Create an API key');
  console.log('4. Add to .env: GOOGLE_PLACES_API_KEY=your_key_here');
  process.exit(1);
}

// Major South African cities and their coordinates
const SA_CITIES = [
  { name: 'Johannesburg', lat: -26.2041, lng: 28.0473, province: 'Gauteng', zone: 'Inland' },
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241, province: 'Western Cape', zone: 'Coastal' },
  { name: 'Durban', lat: -29.8587, lng: 31.0218, province: 'KwaZulu-Natal', zone: 'Coastal' },
  { name: 'Pretoria', lat: -25.7479, lng: 28.2293, province: 'Gauteng', zone: 'Inland' },
  { name: 'Port Elizabeth', lat: -33.9608, lng: 25.6022, province: 'Eastern Cape', zone: 'Coastal' },
  { name: 'Bloemfontein', lat: -29.0852, lng: 26.1596, province: 'Free State', zone: 'Inland' },
  { name: 'Polokwane', lat: -23.9045, lng: 29.4689, province: 'Limpopo', zone: 'Inland' },
  { name: 'Nelspruit', lat: -25.4753, lng: 30.9703, province: 'Mpumalanga', zone: 'Inland' },
  { name: 'Kimberley', lat: -28.7282, lng: 24.7499, province: 'Northern Cape', zone: 'Inland' },
  { name: 'Rustenburg', lat: -25.6672, lng: 27.2423, province: 'North West', zone: 'Inland' },
];

// Fuel brands to search for
const FUEL_BRANDS = ['Shell', 'BP', 'Engen', 'Sasol', 'Total', 'Caltex'];

async function searchGarages(city, brand) {
  const query = `${brand} petrol station ${city.name} South Africa`;
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.log(`⚠️  No results for ${brand} in ${city.name}: ${data.status}`);
      return [];
    }

    return data.results.map(place => ({
      name: place.name,
      address: place.formatted_address,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      fuel_brand: brand,
      city: city.name,
      province: city.province,
      price_zone: city.zone,
      place_id: place.place_id
    }));
  } catch (error) {
    console.error(`❌ Error fetching ${brand} in ${city.name}:`, error.message);
    return [];
  }
}

async function getPlaceDetails(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,website&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      return {
        phone: data.result.formatted_phone_number || null,
        website: data.result.website || null
      };
    }
  } catch (error) {
    console.error(`Error fetching details for ${placeId}:`, error.message);
  }

  return { phone: null, website: null };
}

function parseAddress(address) {
  // Try to extract city and postal code from formatted address
  const parts = address.split(',').map(p => p.trim());

  // Look for postal code (typically 4 digits in SA)
  const postalMatch = address.match(/\b\d{4}\b/);
  const postal_code = postalMatch ? postalMatch[0] : '';

  // Extract street address (first part)
  const street_address = parts[0] || '';

  return { street_address, postal_code };
}

async function fetchAllGarages() {
  console.log('🔍 Fetching real South African garage data from Google Places...\n');

  const allGarages = [];
  let totalFetched = 0;

  for (const city of SA_CITIES) {
    console.log(`\n📍 Searching ${city.name}...`);

    for (const brand of FUEL_BRANDS) {
      const garages = await searchGarages(city, brand);
      console.log(`  ${brand}: Found ${garages.length} stations`);
      allGarages.push(...garages);
      totalFetched += garages.length;

      // Rate limiting - Google allows 50 requests per second
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`\n✅ Total garages found: ${totalFetched}`);

  // Remove duplicates by place_id
  const uniqueGarages = Array.from(
    new Map(allGarages.map(g => [g.place_id, g])).values()
  );

  console.log(`✅ Unique garages: ${uniqueGarages.length}`);

  // Optionally fetch additional details (phone, website)
  console.log('\n📞 Fetching contact details...');
  for (let i = 0; i < Math.min(uniqueGarages.length, 100); i++) {
    const garage = uniqueGarages[i];
    const details = await getPlaceDetails(garage.place_id);
    garage.phone = details.phone;
    garage.website = details.website;

    if (i % 10 === 0) {
      console.log(`  Processed ${i}/${Math.min(uniqueGarages.length, 100)} details...`);
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

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
    const { street_address, postal_code } = parseAddress(garage.address);

    // Default fuel types for SA garages
    const fuel_types = 'Petrol 95|Diesel 50ppm';

    const row = [
      `"${garage.name}"`,
      `"${street_address}"`,
      '', // address_line_2
      `"${garage.city}"`,
      `"${garage.province}"`,
      postal_code,
      garage.latitude,
      garage.longitude,
      garage.phone || '',
      '', // email - not available from Google
      garage.fuel_brand,
      garage.price_zone,
      fuel_types,
      '', // fuel_prices - will need manual update
      '', '', '',
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
      console.log('\n⚠️  No garages found. Check your API key and try again.');
      return;
    }

    // Save to CSV
    const csv = convertToCSV(garages);
    const outputPath = join(__dirname, 'garage_import_data.csv');
    fs.writeFileSync(outputPath, csv, 'utf-8');

    console.log(`\n✅ Saved ${garages.length} garages to: garage_import_data.csv`);
    console.log('\nNext steps:');
    console.log('1. Review and clean the CSV file');
    console.log('2. Add fuel prices (manually or from another source)');
    console.log('3. Add contact email addresses if available');
    console.log('4. Run: node import_garages_from_csv.js');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
