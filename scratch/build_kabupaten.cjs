const turf = require('@turf/turf');
const wellknown = require('wellknown');
const fs = require('fs');
const path = require('path');

// Read kecamatan data
const kecPath = path.join(__dirname, '..', 'public', 'data', 'sidoarjo-kecamatan.json');
const kecData = JSON.parse(fs.readFileSync(kecPath, 'utf8'));

console.log(`Merging ${kecData.length} kecamatan into kabupaten boundary...`);

// Parse each kecamatan WKT to GeoJSON feature
const features = kecData.map(k => {
    const geo = wellknown.parse(k.lokasi);
    return turf.feature(geo, { name: k.kecamatan });
});

// Union all kecamatan polygons into one
let merged = features[0];
for (let i = 1; i < features.length; i++) {
    try {
        merged = turf.union(turf.featureCollection([merged, features[i]]));
        console.log(`  Merged ${i + 1}/${features.length}: + ${kecData[i].kecamatan}`);
    } catch (e) {
        console.error(`  ⚠️ Error merging ${kecData[i].kecamatan}: ${e.message}`);
    }
}

console.log(`\nResult type: ${merged.geometry.type}`);

// Convert merged geometry to WKT
function geoToWKT(geometry) {
    if (geometry.type === 'MultiPolygon') {
        const polys = geometry.coordinates.map(poly => {
            const rings = poly.map(ring => {
                return '(' + ring.map(c => `${c[0]} ${c[1]}`).join(', ') + ')';
            });
            return '(' + rings.join(', ') + ')';
        });
        return 'MULTIPOLYGON (' + polys.join(', ') + ')';
    } else if (geometry.type === 'Polygon') {
        const rings = geometry.coordinates.map(ring => {
            return '(' + ring.map(c => `${c[0]} ${c[1]}`).join(', ') + ')';
        });
        return 'MULTIPOLYGON ((' + rings.join(', ') + '))';
    }
}

const wkt = geoToWKT(merged.geometry);
const totalPoints = wkt.split(',').length;
console.log(`Total points in kabupaten boundary: ${totalPoints}`);

// Save as sidoarjo.json
const result = [{
    kecamatan: "Sidoarjo",
    lokasi: wkt,
    id_kategori: "5",
    kategori: "Kabupaten"
}];

const outPath = path.join(__dirname, '..', 'public', 'data', 'sidoarjo.json');
fs.writeFileSync(outPath, JSON.stringify(result, null, 4), 'utf8');
console.log(`\n✅ Saved kabupaten boundary to ${outPath}`);

// Verify it parses
const verify = wellknown.parse(wkt);
console.log(`Verification: ${verify ? '✅ Valid' : '❌ Invalid'} - ${verify?.type}, ${verify?.coordinates?.length} polygon(s)`);
