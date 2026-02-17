# OSM Garage Import Guide

## Current Status
- **Database**: 95 garages currently loaded
- **Target**: 2,925 garages from OpenStreetMap
- **Remaining**: ~2,830 garages to import

## Prepared Files

### 1. Combined SQL File
- **File**: `combined_osm_all.sql`
- **Size**: 2.1 MB
- **Content**: All 2,925 INSERT statements

### 2. Import Parts (Recommended)
Split into 6 manageable parts:
- `import_part1.sql` - 499 garages
- `import_part2.sql` - 500 garages
- `import_part3.sql` - 500 garages
- `import_part4.sql` - 500 garages
- `import_part5.sql` - 500 garages
- `import_part6.sql` - 426 garages

## Import Methods

### Method 1: Supabase SQL Editor (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/dhklqlqpowrwjplrkfzz
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the content from `import_part1.sql`
5. Click **Run**
6. Repeat for parts 2-6

**Advantages**: Direct, no additional tools needed, visual feedback

### Method 2: Using psql Command Line

```bash
# Set your Supabase database URL
export DATABASE_URL="postgres://postgres.[PASSWORD]@db.dhklqlqpowrwjplrkfzz.supabase.co:5432/postgres"

# Import each part
psql $DATABASE_URL -f import_part1.sql
psql $DATABASE_URL -f import_part2.sql
psql $DATABASE_URL -f import_part3.sql
psql $DATABASE_URL -f import_part4.sql
psql $DATABASE_URL -f import_part5.sql
psql $DATABASE_URL -f import_part6.sql
```

### Method 3: Node.js Script (If you have service role key)

Run the prepared script:
```bash
node import_osm_direct.mjs
```

## Data Structure

Each garage includes:
- Name and brand (Shell, BP, Engen, etc.)
- Full address with GPS coordinates
- Contact information
- Fuel types offered
- Banking details (placeholders)

## Safety Features

All INSERT statements use `ON CONFLICT DO NOTHING`, making the import:
- **Idempotent**: Safe to run multiple times
- **Non-destructive**: Won't overwrite existing data
- **Duplicate-safe**: Skips duplicates automatically

## Verification

After import, verify with:
```sql
SELECT COUNT(*) as total_garages,
       COUNT(DISTINCT province) as provinces,
       COUNT(DISTINCT city) as cities,
       COUNT(DISTINCT fuel_brand) as brands
FROM garages;
```

Expected result:
- Total garages: ~3,019 (95 existing + 2,925 new - some duplicates)
- Provinces: ~9
- Brands: ~8-10

## Troubleshooting

### Import Fails with "permission denied"
- Ensure you're using the service role key or database password
- Check RLS policies in Supabase dashboard

### Import Times Out
- Use smaller batches (split parts into halves)
- Increase timeout in SQL Editor settings

### Duplicate Key Errors
- These are normal and expected
- The `ON CONFLICT DO NOTHING` handles them automatically

## File Locations

All import files are in the project root:
- `combined_osm_all.sql` - Full import
- `import_part*.sql` - Split imports (recommended)
- `import_osm_direct.mjs` - Node.js script
