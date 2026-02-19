# How to Import Your Existing OSM SQL File

Your SQL file has a different format than what our database expects. Here's the easiest way to import your 2925 garages:

## The Problem

Your SQL uses this format:
```sql
INSERT INTO garages (organization_id, name, address_line_1, ...)
VALUES (...)
ON CONFLICT DO NOTHING;
```

But it needs:
1. `DO $$ BEGIN ... END $$` wrapper
2. `IF NOT EXISTS` check
3. Use `organization_type = 'management'` query for org_id

## Quick Solution

**Save your SQL file as `osm_garages.sql` in the project folder**, then I'll create a script that converts it to the correct format.

## Even Better: Convert to CSV

If you can provide me with the **original data source** or tell me:
- Where did this SQL come from?
- Do you have it in CSV or JSON format?

Then I can use the `import_garages.js` script which is much more reliable.

## Manual Fix (If Small Number of Garages)

If you only have a small number of garages (< 50), you can manually convert them:

**Your format:**
```sql
INSERT INTO garages (...) VALUES ('00000000-0000-0000-0000-000000000000', 'Shell', ...)
```

**Correct format:**
```sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM garages WHERE name = 'Shell') THEN
    INSERT INTO garages (
      organization_id, name, email_address, address_line_1, city, province,
      fuel_types, fuel_brand, price_zone, status
    ) VALUES (
      (SELECT id FROM organizations WHERE organization_type = 'management' LIMIT 1),
      'Shell',
      NULL,
      'Main Road',
      'Cape Town',
      'Western Cape',
      ARRAY['Petrol 95','Diesel 50ppm']::text[],
      'Shell',
      'coastal',
      'active'
    );
  END IF;
END $$;
```

## Next Steps

**Tell me:** Do you have the original CSV/JSON data, or should I create a conversion script for your SQL file?

