/**
 * DHARA MEDICOSE — Direct Supabase Importer
 * Reads Book2.csv from Marg ERP and inserts products directly into Supabase.
 * No SQL Editor needed — bypasses the paste size limit.
 *
 * Run: node scripts/direct-import.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const INPUT_CSV   = 'C:\\Users\\Madhav\\Downloads\\Book2.csv';
const BATCH_SIZE  = 100;   // rows per Supabase upsert call
const ENV_FILE    = path.join(__dirname, '..', '.env.local');

// ─── READ .env.local ──────────────────────────────────────────────────────────
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
const SUPABASE_URL      = env['NEXT_PUBLIC_SUPABASE_URL'];
const SERVICE_ROLE_KEY  = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ─── CATEGORY DETECTION ───────────────────────────────────────────────────────
function categorize(name) {
  const n = name.toUpperCase();
  if (/\bBABY\b|PAMPERS|HUGGIES|MAMY[\s-]?POKO|LITTLE[\s-]?ANGEL|DIAPER|DYPER|CERELAC|LACTODEX|GRIPE|WOODWARD|BONNISPAZ|JANMA[\s-]?GHUNTI/.test(n)) return 'Baby Care';
  if (/SYRINGE|SRINGE|SRNG\b|NIDDLE|NEEDLE|NIDD|BANDAGE|BNDG\b|\bCOTTON\b|GLOVES|GLAP\b|IV\s*SET|I\.V\.|INFUSION|THERMOMETER|B\.P\.[\s-]*METER|PULSE[\s-]*OX|STETH|INTRACATH|CANNULA|CATHETER|SCALP[\s-]*VAN|PAPER[\s-]*TAP|BELADONA|PLAIN[\s-]*SEET|SURGICAL[\s-]*KN|FOLEY|H\.B\.[\s-]*METER|WEIGHT[\s-]*MACHINE|CREPE/.test(n)) return 'Surgical';
  if (/\bVITAMIN|\bREVITAL\b|BECOSULE|BECOZINC|BECADEXAMIN|BEPLAX\b|BEPLEX\b|NEUROBION|SUPRADYN|EVION\b|LIMCEE|CALCIUM|\bSHELCAL|\bGEMCAL|\bCALBIT|\bOSSPAN|\bCIPCAL|CALDIKIND|DEXORANGE|LIVOGEN|OROFER|\bAUTRIN|\bMULTIVIT|NUROKIND|BENFOSYN|COLIUS[\s-]*D3|TONRISE|ROKVIT|LYBOSAN\b|FOLVITE|FOLIOST|FOLTOP|FOLSHINE|REDSAN\b|MULTIWIL|A[\s-]?TO[\s-]?Z[\s-]?TAB|A[\s-]?TO[\s-]?Z[\s-]?SYP|A[\s-]?TO[\s-]?Z[\s-]?DROP|DEXORANGE|FEMIRIT|LIVZAN/.test(n)) return 'Vitamins';
  if (/\bSOAP\b|SHAMPOO|SHAM\b|SHMP\b|TOOTH[\s-]*PAS|TOOTH[\s-]*BRUS|MOUTH[\s-]*WASH|\bM\/W\b|HAIR[\s-]*OIL\b|\bOILT\b|\bDEO\b|\bDEODO|AGARBATTI|AGAR\b|NAPHTHAL|PHENYLE|SANITI[ZS]ER|HAND[\s-]*WASH|H\/W\b|NAIL[\s-]*CLIP|TONGUE[\s-]*CLEAN|CONDOM|\bCOND\b|BALM\b|PAIN[\s-]*BALM|MOSQUITO|MORTEIN|ALLOUT|GOOD[\s-]*KNIGHT|MAXO|SANITARY|PADS\b|STAYFREE|WHISPER|SOFY\b|JUMBO.*PAD|COMFORT[\s-]*COND|HAIR[\s-]*COLO|MEHANDI\b|VEET\b|HAIR[\s-]*REMOV|KESH[\s-]*KING|INDULEKHA|NAVRATNA[\s-]*OIL|NIHAR|BAJAJ.*ALMOND|FIGARO\b|SESA[\s-]*OIL|LAL[\s-]*TAIL|CASTOR[\s-]*OIL|PARACHUTE|JHARAN|JAPANI[\s-]*OIL|HAIR[\s-]*CARE[\s-]*OIL|DAZZLE[\s-]*OIL|SARSO[\s-]*OIL|PUDIN[\s-]*HARA|HAJMOLA|IODEX|TIGER[\s-]*BALM|TIGER[\s-]*KING|ZANDU[\s-]*BALM|AMRUTANJAN|FAST[\s-]*RELIEF|MOOV\b|OMNIGEL|GILLETTE|GILLETE|RAZOR|BLADE\b|VENUS[\s-]*GILL|VICKS[\s-]*VAPOR|VICKS[\s-]*BABY|VICKS[\s-]*INH|MOSQUITO|LAXMAN[\s-]*REKHA|RATOL|US[\s-]*RATOL|D-DOCTOR|D\.DOCTOR|DIAMOND[\s-]*HARA|HARA[\s-]*MALHAM|KAYAM\b|BOROLINE|BORO[\s-]*PLUS|FAST[\s-]*CARD|GLUCON[\s-]*D|BOURN[\s-]*VITA|COMPLAN\b|HONEY\b|ISAPGOL|TRIPHALA|ASHWAGANDHA|SAFI\b|CHAWANPRAS|PET[\s-]*SAFA|GULABARI|GULAB[\s-]*ROSE|GLUCOSE\b|STREAX\b|VASMOL\b|NISHA[\s-]*HAIR|GARNIER.*HAIR|EXPERT.*CREAM.*BLACK|EXPERT.*CREAM.*BROWN|CLINIC[\s-]*PLUS|VATIKA\b|DOVE\b|HIMALAYA.*SCRUB|HIMALAYA.*KESAR|HIMALAYA.*FACE.*WASH|HIMALAYA.*NEEM.*FACE|PATANJALI.*SHAMPOO|PATANJALI.*SOAP|PATANJALI.*KESH|MEDICAR[\s-]*SHAMPOO|RINGGUARD|RING[\s-]*GUARD/.test(n)) return 'Personal Care';
  if (/FACE[\s-]*WASH|FACEWASH|F\/W\b|FACE[\s-]*PACK|FACE[\s-]*MASK|SCRUB\b|\bSERUM\b|SUNSCREEN|SPF\b|BLEACH\b|MOISTUR|FAIR.*LOVELY|POND'?S\b|PONDS\b|OLAY\b|NIVEA\b|GARNIER\b|LAKME\b|ALOE[\s-]*VERA[\s-]*GEL|ROSE[\s-]*WATER|LIP[\s-]*BALM|BEAUTY[\s-]*CREAM|TWINKLE[\s-]*CREAM|CALADRYL|CALAHOP|CALAPURE|CALAMINE|JOY\b|HIMALAYA.*CREAM|HIMALAYA.*LOTION|HIMALAYA.*LIP|EVERYUTH|MELAMET\b|LOMELA\b|SKINLITE\b|SKINSHINE\b|NO[\s-]?SCAR|CUTIS[\s-]*CREAM|COLLEGIAN[\s-]*CREAM|EPIFEEL\b|CLARINA\b|CURIGLOW\b|TWINKLE\b|SAUNDARYA\b|FOOT[\s-]*CARE[\s-]*CREAM|FLOROZONE\b|VICCO.*CREAM|WHITE[\s-]*TONE|SPINZ\b|PATANJALI.*BEAUTY|NO[\s-]*CHAI|JOY[\s-]*SKIN|JOY[\s-]*BODY|JOY[\s-]*SUN|FAIR[\s-]*&[\s-]*HAND|FAIR[\s-]*HAND|HIMALAYA[\s-]*NATURAL[\s-]*GLOW|HIMALAYA[\s-]*DIAPER/.test(n)) return 'Skincare';
  return 'Medicines';
}

function requiresPrescription(name) {
  const n = name.toUpperCase();
  return /\bINJ\b|\bINJT\b|INJECTION|AMOX|AZITHRO|CIPROFLOX|CEFIXIME|CEFPODOX|CEFTRIAX|CLAVAM|AUGMENT|CEFADROX|METFORMIN|GLIMEPIRIDE|GLIBENCLAMIDE|GLIPIZIDE|TELMISARTAN|AMLODIPINE|ATENOLOL|RAMIPRIL|ROSUVASTATIN|ATORVASTATIN|WARFARIN|ESCITALO|OLANZAPINE|RISPERIDONE|CLONAZEPAM|ALPRAZOLAM|DIAZEPAM|LIBRIUM|CLOBAZAM|FRISIUM|PREDNISOLONE|DEXAMETHASONE|DEFLAZACORT|METHOTREXATE|CARBAMAZEPINE|LEVETIRACETAM|ISOTROIN|COLCHICINE|HYDROXY[\s-]*CHLORO|ACYCLOVIR|ACIVIR|METRONIDAZOLE|METROGYL|FLAGYL|DISULFIRAM|FOLITRAX|MEXATE|ENCORATE|VALPROL|DIVAA|NEXITO|OLEANZ|SIZODON|RISALLY|CLOZCARE|MIRATAZ|PAROXETINE|DUVANTA|TRIPTOMER|TRYPTOMER|SOLOPOSE|ASENXIT|CLONAFIT|MATBENZ|ALLYBENZ|ALLYPREX|DEZOMAC|ISTAMET|ISTAVEL|VIDAGLO|ZOMELIS|OLMEZEST|OLMESAR|NICARDIA|TELMIKIND|TELMA\b|SARTEL\b|TELVAS\b|TEMSAN\b|TAZLOC|BESICOR|CARDACE\b|LODOZ\b|RAMISTAR|PRESARTAN|TONACT|ATORVA|LIPIKIND|STORVAS|ROSUVAS|ROSEDAY|ECOSPRIN|DEPLATT|CLOPIKIND|CLOPILET|GLYCOMET|GLYCIPHAGE|GEMER\b|GLYKIND|GLUCONORM|GLUCORED|OBIMET|RIOMET|GLUFORMIN|GLYCINORM|GLIMESTAR|GLYCIGON|ZORYL|GLYNASE|VIGORE\b|MANFORCE[\s-]*100|MEGALIS\b|LEVERA\b|MAZETOL\b|GABAPENTIN|GABAPIN|GABAMAX|GABANEURON|SYNAPSE\b|ENCORATE\b/.test(n);
}

function parseQuantity(raw) {
  if (!raw || raw.trim() === '') return 0;
  raw = raw.trim();
  let num;
  if (/^\-?\d+:\d+/.test(raw)) {
    const [packs] = raw.split(':');
    num = parseInt(packs) * 10;
  } else {
    num = parseFloat(raw);
  }
  return isNaN(num) || num < 0 ? 0 : Math.floor(num);
}

function parseCSVLine(line) {
  const cols = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
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

const CAT_COLORS = {
  'Medicines': '0ea5e9', 'Vitamins': '22c55e', 'Skincare': 'ec4899',
  'Baby Care': 'eab308', 'Surgical': 'ef4444', 'Personal Care': 'a855f7',
};

function imageUrl(name, category) {
  const color = CAT_COLORS[category] || '0ea5e9';
  const label = encodeURIComponent(name.replace(/'/g, '').substring(0, 18).replace(/\s+/g, '+'));
  return `https://placehold.co/400x400/${color}/white?text=${label}`;
}

function description(name) {
  const n = name.toUpperCase();
  if (n.includes('TAB'))    return `${name} tablet. Available at DHARA MEDICOSE, Barwani.`;
  if (n.includes('CAP'))    return `${name} capsule. Available at DHARA MEDICOSE, Barwani.`;
  if (n.includes('SYP') || n.includes('SYRUP')) return `${name} syrup. Available at DHARA MEDICOSE, Barwani.`;
  if (n.includes('INJ'))    return `${name} injection. Available at DHARA MEDICOSE, Barwani.`;
  if (n.includes('DROP'))   return `${name} drops. Available at DHARA MEDICOSE, Barwani.`;
  if (n.includes('CREAM') || n.includes('CREM') || n.includes('OINT')) return `${name}. Topical application. Available at DHARA MEDICOSE, Barwani.`;
  return `${name}. Available at DHARA MEDICOSE, Barwani.`;
}

// ─── PARSE CSV ────────────────────────────────────────────────────────────────
console.log('📂  Reading CSV...');
const csvRaw = fs.readFileSync(INPUT_CSV, 'utf8');
const lines  = csvRaw.split(/\r?\n/);

const products = [];
const seen = new Set();
let pendingName = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const cols = parseCSVLine(line);

  if (isProductName(cols)) {
    pendingName = cols[0].trim();
    continue;
  }

  const first = (cols[0] || '').trim();
  if (first.startsWith('Opening Balance') && pendingName) {
    const rawQty = cols[7] || cols[cols.length - 1] || '0';
    const stock  = parseQuantity(rawQty);
    const key    = pendingName.toUpperCase();
    if (!seen.has(key)) {
      seen.add(key);
      const cat = categorize(pendingName);
      const rx  = requiresPrescription(pendingName);
      products.push({
        name: pendingName,
        description: description(pendingName),
        price: 0,
        mrp: 0,
        category: cat,
        image_url: imageUrl(pendingName, cat),
        stock,
        requires_prescription: rx,
        is_active: false,
      });
    }
    pendingName = null;
  }
}

console.log(`✅  Parsed ${products.length} unique products from CSV`);

// ─── CATEGORY SUMMARY ─────────────────────────────────────────────────────────
const summary = {};
products.forEach(p => { summary[p.category] = (summary[p.category] || 0) + 1; });
Object.entries(summary).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
  console.log(`   ├─ ${k.padEnd(15)} ${v}`);
});

// ─── INSERT INTO SUPABASE IN BATCHES ──────────────────────────────────────────
async function run() {
  console.log(`\n🚀  Inserting into Supabase in batches of ${BATCH_SIZE}...`);

  let inserted = 0;
  let errors   = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('products')
      .upsert(batch, { onConflict: 'name', ignoreDuplicates: false });

    if (error) {
      console.error(`   ❌  Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message);
      errors += batch.length;
    } else {
      inserted += batch.length;
      const pct = Math.round((inserted / products.length) * 100);
      process.stdout.write(`\r   Progress: ${inserted}/${products.length} (${pct}%)   `);
    }
  }

  console.log(`\n\n✅  Done! Inserted: ${inserted}  |  Errors: ${errors}`);
  console.log('\n⚠️  All products have price=0 and is_active=false.');
  console.log('   Go to /admin/products to set prices and activate them.\n');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
