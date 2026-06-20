/**
 * DHARA MEDICOSE — Extract prices from Marg ERP CSV and update Supabase
 * Sale lines have: BillNo, Sale, Patient, Doctor, Batch, Qty, Value, BalanceQty
 * Price per unit = total Value / total qty_units (packs×10 + loose)
 *
 * Run: node scripts/update-prices.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const INPUT_CSV  = 'C:\\Users\\Madhav\\Downloads\\Book2.csv';
const ENV_FILE   = path.join(__dirname, '..', '.env.local');
const BATCH_SIZE = 50;

// ─── ENV ──────────────────────────────────────────────────────────────────────
function loadEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
  return env;
}

const env = loadEnv(ENV_FILE);
const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

// ─── CSV PARSER ───────────────────────────────────────────────────────────────
function parseCSVLine(line) {
  const cols = [];
  let current = '', inQuotes = false;
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { cols.push(current); current = ''; }
    else { current += ch; }
  }
  cols.push(current);
  return cols;
}

function isProductName(cols) {
  const first = (cols[0] || '').trim();
  if (!first || first.length < 3) return false;
  if (first.startsWith('Opening Balance')) return false;
  if (/^\d{1,2}-\d{2}-\d{4}$/.test(first)) return false;
  if (/^A0\d{5}/.test(first)) return false;
  if (first.startsWith('Issued :')) return false;
  if (first === 'CASH' || first === 'Bill No./ Date') return false;
  if (/DHARA|SHOP NO|BARWANI|Mfg\.Lic|STOCK REGISTER/.test(first)) return false;
  return cols.slice(1).every(c => !c || c.trim() === '');
}

function isSaleLine(cols) {
  return /^A0\d{5}/.test((cols[0] || '').trim()) && (cols[1] || '').trim() === 'Sale';
}

// qty: "01:05" → packs=1, loose=5 → total = 1*10+5 = 15 units
function qtyUnits(raw) {
  if (!raw || raw.trim() === '') return 0;
  raw = raw.trim();
  if (/^\-?\d+:\d+/.test(raw)) {
    const [p, l] = raw.split(':').map(s => parseInt(s) || 0);
    return Math.max(0, p * 10 + l);
  }
  const n = parseFloat(raw);
  return isNaN(n) || n < 0 ? 0 : Math.floor(n);
}

// ─── PARSE CSV → product price map ───────────────────────────────────────────
console.log('📂  Reading CSV and extracting prices...');
const csvRaw = fs.readFileSync(INPUT_CSV, 'utf8');
const lines  = csvRaw.split(/\r?\n/);

// Map: productName → { totalValue, totalUnits }
const priceMap = new Map();
let currentName = null;

for (const rawLine of lines) {
  const line = rawLine.trim();
  if (!line) continue;
  const cols = parseCSVLine(line);

  if (isProductName(cols)) {
    currentName = cols[0].trim();
    if (!priceMap.has(currentName)) {
      priceMap.set(currentName, { totalValue: 0, totalUnits: 0 });
    }
    continue;
  }

  if (isSaleLine(cols) && currentName) {
    const qty   = qtyUnits(cols[5] || '');
    const value = parseFloat(cols[6] || '0') || 0;
    if (qty > 0 && value > 0) {
      const entry = priceMap.get(currentName);
      entry.totalValue += value;
      entry.totalUnits += qty;
    }
  }
}

// Build price list: products with sales only
const priceList = [];
for (const [name, { totalValue, totalUnits }] of priceMap) {
  if (totalUnits > 0 && totalValue > 0) {
    const pricePerUnit = totalValue / totalUnits;
    // Round to nearest ₹0.50
    const price = Math.round(pricePerUnit * 2) / 2;
    const mrp   = Math.round(price * 1.05 * 2) / 2; // MRP = price + 5% (typical retail)
    priceList.push({ name, price, mrp });
  }
}

console.log(`✅  Found prices for ${priceList.length} products (from sale transactions)`);
if (priceList.length === 0) {
  console.log('\n⚠️  No sale transactions found. The CSV may not have any sales data for this date range.');
  process.exit(0);
}

// Sample preview
console.log('\n   Sample prices:');
priceList.slice(0, 5).forEach(({ name, price, mrp }) => {
  console.log(`   ₹${price.toFixed(2)} (MRP ₹${mrp.toFixed(2)})  →  ${name}`);
});
console.log('   ...');

// ─── UPDATE SUPABASE ──────────────────────────────────────────────────────────
async function run() {
  console.log(`\n🚀  Updating prices in Supabase (${priceList.length} products)...`);

  let updated = 0, notFound = 0, errors = 0;

  for (let i = 0; i < priceList.length; i += BATCH_SIZE) {
    const batch = priceList.slice(i, i + BATCH_SIZE);

    // Update one by one (name-based lookup, no bulk update by name in Supabase)
    const promises = batch.map(({ name, price, mrp }) =>
      supabase
        .from('products')
        .update({ price, mrp })
        .eq('name', name)
        .select('id')
        .then(({ data, error }) => {
          if (error) { errors++; return; }
          if (!data || data.length === 0) { notFound++; return; }
          updated++;
        })
    );

    await Promise.all(promises);
    const done = Math.min(i + BATCH_SIZE, priceList.length);
    process.stdout.write(`\r   Progress: ${done}/${priceList.length}   `);
  }

  console.log(`\n\n✅  Done!`);
  console.log(`   Updated : ${updated} products`);
  console.log(`   Not found: ${notFound} (name mismatch — update manually)`);
  console.log(`   Errors  : ${errors}`);
  console.log('\n   Remaining products with price=0 → set via Admin panel.\n');
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
