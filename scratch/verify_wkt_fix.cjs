const wellknown = require('wellknown');
const fs = require('fs');
const path = require('path');

// Test 1: Kabupaten data (MULTIPOLYGON Z)
console.log("=== Test 1: Kabupaten (sidoarjo.json) ===");
const kabData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'sidoarjo.json'), 'utf8'));
for (const item of kabData) {
    const wktOriginal = item.lokasi;
    const wktFixed = wktOriginal.replace(/(POLYGON|MULTIPOLYGON)\s+Z/i, '$1');
    
    const geoOriginal = wellknown.parse(wktOriginal);
    const geoFixed = wellknown.parse(wktFixed);
    
    console.log(`  Original parse: coords=${geoOriginal?.coordinates?.length || 0} (type: ${geoOriginal?.type})`);
    console.log(`  Fixed parse:    coords=${geoFixed?.coordinates?.length || 0} (type: ${geoFixed?.type})`);
    
    if (geoFixed && geoFixed.coordinates && geoFixed.coordinates.length > 0) {
        console.log(`  ✅ Kabupaten: PASS - ${geoFixed.coordinates[0][0].length} points in first polygon`);
    } else {
        console.log(`  ❌ Kabupaten: FAIL - no coordinates parsed`);
    }
}

// Test 2: Kecamatan data  
console.log("\n=== Test 2: Kecamatan (sidoarjo-kecamatan.json) ===");
const kecData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'sidoarjo-kecamatan.json'), 'utf8'));
let kecPass = 0, kecFail = 0;
for (const item of kecData) {
    const wktFixed = item.lokasi.replace(/(POLYGON|MULTIPOLYGON)\s+Z/i, '$1');
    const geo = wellknown.parse(wktFixed);
    
    if (geo && geo.coordinates && geo.coordinates.length > 0) {
        kecPass++;
    } else {
        kecFail++;
        console.log(`  ❌ ${item.kecamatan}: FAIL`);
    }
}
console.log(`  ✅ ${kecPass} passed, ❌ ${kecFail} failed out of ${kecData.length} kecamatan`);

// Test 3: Desa data (MULTIPOLYGON Z)
console.log("\n=== Test 3: Desa (sidoarjo-desa.json) ===");
const desaData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'sidoarjo-desa.json'), 'utf8'));
let desaPass = 0, desaFail = 0, desaFallback = 0;
for (const item of desaData) {
    const wktFixed = item.lokasi.replace(/(POLYGON|MULTIPOLYGON)\s+Z/i, '$1');
    const geo = wellknown.parse(wktFixed);
    
    if (geo && geo.coordinates && geo.coordinates.length > 0) {
        desaPass++;
    } else {
        desaFail++;
        desaFallback++;
        if (desaFail <= 5) {
            const name = item.desa || item.NAMOBJ || item.namobj || "unknown";
            console.log(`  ❌ ${name}: FAIL (will need fallback)`);
        }
    }
}
console.log(`  ✅ ${desaPass} passed, ❌ ${desaFail} failed out of ${desaData.length} desa`);
if (desaFail > 0) {
    console.log(`  ⚠️  ${desaFallback} villages will still use fallback parsing`);
}

console.log("\n=== Summary ===");
console.log("The WKT Z-strip fix should eliminate most 'Standard parsing failed' warnings.");
console.log("Villages with fallback will still work via the manual coordinate extraction.");
