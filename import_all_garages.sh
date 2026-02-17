#!/bin/bash
# Import all OSM garages in batches

echo "========================================="
echo "  OSM Garage Batch Import"
echo "========================================="
echo ""

# Export environment variables
export $(grep -v '^#' .env | xargs)

# Counter
total_imported=0

# Get current count
echo "Checking current garage count..."
current_count=$(psql "$SUPABASE_DB_URL" -t -c "SELECT COUNT(*) FROM garages;" 2>/dev/null | tr -d ' ')

if [ -z "$current_count" ]; then
  echo "Note: Cannot connect directly to database. Will use migration approach."
  echo ""
  echo "Please run the migration file manually:"
  echo "  supabase/migrations/20260217084501_import_500_western_cape_garages.sql"
  echo ""
  echo "Or import via the Supabase Dashboard SQL Editor"
  exit 0
fi

echo "Current garages in database: $current_count"
echo ""

# Process each chunk
for chunk_file in osm_chunk_*; do
  if [ -f "$chunk_file" ]; then
    echo "Processing $chunk_file..."

    # Count INSERT statements in this chunk
    insert_count=$(grep -c "INSERT INTO garages" "$chunk_file")

    # Import via psql
    psql "$SUPABASE_DB_URL" -f "$chunk_file" -q

    if [ $? -eq 0 ]; then
      echo "  ✓ Imported $insert_count garages"
      total_imported=$((total_imported + insert_count))
    else
      echo "  ✗ Failed"
    fi

    # Small delay to avoid rate limiting
    sleep 0.1
  fi
done

# Get final count
final_count=$(psql "$SUPABASE_DB_URL" -t -c "SELECT COUNT(*) FROM garages;" | tr -d ' ')

echo ""
echo "========================================="
echo "  Import Complete!"
echo "========================================="
echo "Initial count: $current_count"
echo "Final count: $final_count"
echo "Added: $((final_count - current_count))"
echo "========================================="
