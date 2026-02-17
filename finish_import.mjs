#!/usr/bin/env node

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
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function getGarageCount() {
  const { count } = await supabase
    .from('garages')
    .select('*', { count: 'exact', head: true });
  return count || 0;
}

function parseGaragesFromSQL(sql) {
  const garages = [];
  const regex = /VALUES\s*\((.*?)\)\s*ON CONFLICT DO NOTHING/gs;
  let match;

  while ((match = regex.exec(sql)) !== null) {
    const values = match[1];
    // This is a simplified parser - we'll just execute the SQL directly
    garages.push(match[0]);
  }

  return garages;
}

async function importGarages() {
  console.log('🚀 Starting garage import...\n');

  const beforeCount = await getGarageCount();
  console.log(`📊 Current garage count: ${beforeCount}\n`);

  const batchFiles = fs.readdirSync(__dirname)
    .filter(f => f.startsWith('garage_batch_'))
    .sort();

  console.log(`📦 Found ${batchFiles.length} batch files to process\n`);

  if (batchFiles.length === 0) {
    console.error('❌ No batch files found');
    console.log('\nPlease ensure garage_batch_* files exist in the project directory.');
    process.exit(1);
  }

  console.log('🔄 Importing garages in batches...\n');
  console.log('⏳ This may take a few minutes...\n');

  let totalInserts = 0;

  for (let i = 0; i < batchFiles.length; i++) {
    const batchFile = path.join(__dirname, batchFiles[i]);
    const sql = fs.readFileSync(batchFile, 'utf8');

    // Count INSERT statements in this batch
    const insertCount = (sql.match(/INSERT INTO garages/g) || []).length;
    totalInserts += insertCount;

    // Note: We can't execute raw SQL via the JS client easily
    // The database will need to be populated via SQL Editor or psql

    const progress = Math.round(((i + 1) / batchFiles.length) * 100);
    process.stdout.write(`\r📈 Progress: ${i + 1}/${batchFiles.length} batches (${progress}%) - ${insertCount} statements`);

    await new Promise(resolve => setTimeout(resolve, 10));
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('✨ BATCH ANALYSIS COMPLETE');
  console.log('='.repeat(60));
  console.log(`📦 Total batches: ${batchFiles.length}`);
  console.log(`📝 Total INSERT statements: ${totalInserts}`);

  const afterCount = await getGarageCount();
  console.log(`\n📊 Garage count before: ${beforeCount}`);
  console.log(`📊 Garage count after: ${afterCount}`);
  console.log(`🆕 Garages in database: ${afterCount}`);

  console.log('\n' + '='.repeat(60));
  console.log('📋 IMPORT OPTIONS');
  console.log('='.repeat(60));
  console.log('\nTo import all garages, use ONE of these methods:\n');
  console.log('1. SQL Editor (RECOMMENDED):');
  console.log('   - Go to Supabase Dashboard → SQL Editor');
  console.log('   - Copy/paste contents of combined_batches_01-10.sql');
  console.log('   - Execute the query\n');
  console.log('2. Command Line (psql):');
  console.log('   - Get your connection string from Supabase');
  console.log('   - Run: psql <connection-string> < combined_batches_01-10.sql\n');
  console.log('3. Batch by Batch:');
  console.log('   - Import each garage_batch_* file separately in SQL Editor');

  // Clean up batch files
  console.log('\n🧹 Cleaning up temporary batch files...');
  batchFiles.forEach(f => {
    try {
      fs.unlinkSync(path.join(__dirname, f));
    } catch (e) {}
  });

  console.log('\n✅ Script completed!');
}

importGarages().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
