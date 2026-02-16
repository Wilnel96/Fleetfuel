# Real South African Garage Data Import Guide

This guide explains how to import **real, accurate** garage data for South Africa into your system.

## Quick Start - Choose Your Method

### Option 1: Google Places API (Most Accurate) ⭐ RECOMMENDED
- **Pros**: Most accurate, complete data with phone numbers
- **Cons**: Requires paid API key (but has free tier)
- **Data Quality**: Excellent
- **Cost**: Free tier: $200/month credit (~30,000 searches)

### Option 2: OpenStreetMap (Free)
- **Pros**: Completely free, no API key needed
- **Cons**: Data quality varies, some info may be missing
- **Data Quality**: Good to Fair (depends on region)
- **Cost**: Free

### Option 3: Manual Web Research
- **Pros**: Most control over data quality
- **Cons**: Time-consuming
- **Data Quality**: Excellent
- **Cost**: Free (just time)

---

## Method 1: Google Places API (Recommended)

### Step 1: Get API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **Places API** (in APIs & Services)
4. Create credentials → API Key
5. Restrict the key to "Places API" only (for security)

### Step 2: Add API Key to .env

```bash
# Add this line to your .env file
GOOGLE_PLACES_API_KEY=your_api_key_here
```

### Step 3: Run the Fetcher

```bash
node fetch_sa_garages_google.js
```

This will:
- Search all major SA cities
- Find garages for all fuel brands (Shell, BP, Engen, Sasol, Total, Caltex)
- Fetch addresses, coordinates, phone numbers
- Save to `garage_import_data.csv`

### Step 4: Review and Clean

1. Open `garage_import_data.csv`
2. Review the data for accuracy
3. Add any missing information:
   - Email addresses
   - Current fuel prices
   - Contact person names
   - VAT numbers
   - Banking details

### Step 5: Import

```bash
# Rename the file
mv garage_import_data.csv garage_import_template.csv

# Run the import
node import_garages_from_csv.js
```

---

## Method 2: OpenStreetMap (Free)

### Step 1: Run the Fetcher

```bash
node fetch_sa_garages_osm.js
```

This will:
- Query OpenStreetMap for all fuel stations in SA
- Cover all 9 provinces
- Save to `garage_import_data_osm.csv`
- Takes ~20-30 seconds (includes rate limiting)

### Step 2: Clean the Data

OpenStreetMap data quality varies. You should:

1. Open `garage_import_data_osm.csv`
2. Remove or fix entries with:
   - Missing or unclear names
   - "Unknown" cities
   - Incorrect fuel brands
3. Add missing information:
   - Proper garage names
   - Current fuel prices
   - Contact information

### Step 3: Import

```bash
# Rename the file
mv garage_import_data_osm.csv garage_import_template.csv

# Run the import
node import_garages_from_csv.js
```

---

## Method 3: Manual Research

### Official Fuel Company Locators

Visit these websites and manually compile data:

1. **Shell**: https://www.shell.co.za/motorists/shell-station-locator.html
2. **BP**: https://www.bp.com/en_za/south-africa/home/products-services/find-a-service-station.html
3. **Engen**: https://www.engen.co.za/service-station-locator
4. **Sasol**: https://www.sasol.com/station-finder
5. **Total**: https://www.totalenergies.co.za/station-locator
6. **Caltex**: https://www.caltex.co.za/en/find-a-station

### Manual CSV Creation

1. Open `garage_import_template.csv`
2. Fill in the data manually:
   - Required: `name`
   - Recommended: `address`, `city`, `province`, `fuel_brand`, `latitude`, `longitude`
   - Optional: Everything else

3. Save and import:
```bash
node import_garages_from_csv.js
```

---

## Current Fuel Prices (Update These)

As of February 2026, approximate SA fuel prices:

**Inland (Gauteng)**:
- Petrol 95: R24.50/L
- Petrol 93: R24.30/L
- Diesel 50ppm: R23.80/L
- Diesel 500ppm: R23.70/L

**Coastal (Western Cape, KZN, Eastern Cape)**:
- Petrol 95: R23.70/L
- Petrol 93: R23.50/L
- Diesel 50ppm: R23.00/L
- Diesel 500ppm: R22.90/L

Check latest prices at: https://www.energy.gov.za/files/petroleum_frame.html

---

## CSV Format Reference

### Minimal Import (Only Name Required)
```csv
name,address,city,province,fuel_brand,price_zone
Shell Hatfield,1147 Burnett St,Hatfield,Gauteng,Shell,Inland
```

### Full Import (All Fields)
```csv
name,address,address_line_2,city,province,postal_code,latitude,longitude,phone,email,fuel_brand,price_zone,available_fuel_types,fuel_prices_petrol_95,fuel_prices_petrol_93,fuel_prices_diesel_50ppm,fuel_prices_diesel_500ppm,other_offerings,contact_1_name,contact_1_surname,contact_1_email,contact_1_office_phone,contact_1_mobile_phone,vat_number
Shell Hatfield,1147 Burnett St,,Hatfield,Gauteng,0083,-25.7486,28.2292,012 362 3456,hatfield@shell.co.za,Shell,Inland,Petrol 95|Diesel 50ppm,24.50,,23.80,,Convenience Store|Car Wash,John,Smith,john@shell.co.za,012 362 3456,082 123 4567,4123456789
```

---

## Important Notes

### Data Quality
- **Google Places**: Most accurate addresses and coordinates
- **OpenStreetMap**: Good coverage but variable quality
- **Manual**: Best for getting contact info and banking details

### Fuel Prices
- Prices change monthly (first Wednesday of each month)
- Must be updated regularly
- Source: Department of Mineral Resources and Energy

### Default Password
All imported garages get password: `TempPassword123!`
- Garages must change this on first login
- Send credentials securely to each garage

### Required vs Optional
- **ONLY** `name` is required
- Everything else is optional
- Garages can update their info later

### Duplicates
The import script checks for duplicates by name and skips them.

---

## Bulk Import Checklist

Before importing hundreds of garages:

- [ ] Back up your database
- [ ] Test import with 5-10 garages first
- [ ] Verify data quality
- [ ] Check all fuel brands are represented
- [ ] Confirm provinces are correct
- [ ] Validate GPS coordinates
- [ ] Set realistic fuel prices
- [ ] Prepare welcome emails for garages
- [ ] Document default credentials

---

## After Import

### 1. Verify Import Success
```bash
# Log in to your system
# Go to "Garage Management"
# Check that all garages appear correctly
```

### 2. Notify Garages
Send each garage:
- Their login credentials
- System access URL
- Instructions to change password
- Support contact information

### 3. Monitor for Issues
- Check for duplicate entries
- Verify GPS coordinates on map
- Ensure garages can log in
- Confirm data accuracy

---

## Troubleshooting

### "No results found"
- **Google**: Check API key is valid and Places API is enabled
- **OSM**: Try again later (free API can be slow)
- **Both**: Check internet connection

### "Invalid coordinates"
- Some coordinates may be outside South Africa
- Filter by latitude: -35 to -22
- Filter by longitude: 16 to 33

### "Missing garage names"
- More common with OSM data
- Manually fill in from fuel brand + location
- Example: "Shell Hatfield Station"

### "Import errors"
- Check CSV format is correct
- Ensure no commas in text fields (or wrap in quotes)
- Verify all rows have same number of columns

---

## Recommended Workflow

For best results before system split:

1. **Run Google Places fetcher** (if you have API key)
   - Get comprehensive, accurate base data

2. **Run OpenStreetMap fetcher** (as backup/supplement)
   - Fill in any gaps from Google data

3. **Merge both datasets**
   - Combine CSVs
   - Remove duplicates
   - Keep best data from each source

4. **Manual enhancement**
   - Add contact emails from garage websites
   - Add current fuel prices
   - Add VAT numbers
   - Add banking details

5. **Test import** (5-10 garages first)
   - Verify everything works
   - Check data appears correctly

6. **Full import**
   - Import all garages
   - Back up database first

7. **Verification & notification**
   - Check all data
   - Send credentials to garages
   - Monitor for issues

---

## Support

If you encounter issues:
1. Check the error message carefully
2. Verify CSV format matches template
3. Ensure database connection is working
4. Review migration status
5. Check RLS policies allow inserts

For Google Places API issues:
- Verify API key is correct
- Check billing is enabled
- Confirm Places API is activated
- Review API quotas/limits

For OpenStreetMap issues:
- Wait a few minutes and retry
- Check internet connection
- Verify Overpass API is responding
