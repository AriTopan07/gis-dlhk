const fs = require('fs');
const path = require('path');

// Try to load wellknown from node_modules
let wellknown;
try {
    wellknown = require('../node_modules/wellknown');
} catch (e) {
    console.error('Could not find wellknown in node_modules, using fallback stringification');
}

const rawData = JSON.parse(fs.readFileSync('raw_kecamatan.json', 'utf8'));

// The downloaded GeoJSON seems to have village-level data or multiple features per sub-district if it's "administrasi_ar_kecamatan"
// Let's group by namobj and merge geometries if needed, OR check if each feature is already a full kecamatan.
// Based on the output of GetFeature, it might be that each feature is a kecamatan.

const kecamatanMap = {};

rawData.features.forEach(feature => {
    const name = feature.properties.namobj;
    if (!kecamatanMap[name]) {
        kecamatanMap[name] = [];
    }
    kecamatanMap[name].push(feature.geometry);
});

const result = [];

for (const name in kecamatanMap) {
    const geometries = kecamatanMap[name];
    let finalGeometry;
    
    if (geometries.length === 1) {
        finalGeometry = geometries[0];
    } else {
        // If there are multiple polygons for one kecamatan (e.g. islands or divided areas), 
        // we should ideally combine them into a MultiPolygon.
        const allCoords = [];
        geometries.forEach(geo => {
            if (geo.type === 'Polygon') {
                allCoords.push(geo.coordinates);
            } else if (geo.type === 'MultiPolygon') {
                allCoords.push(...geo.coordinates);
            }
        });
        finalGeometry = {
            type: 'MultiPolygon',
            coordinates: allCoords
        };
    }

    let wkt;
    if (wellknown) {
        wkt = wellknown.stringify(finalGeometry);
    } else {
        // Fallback: very basic WKT generator if wellknown is not available
        // Note: This is simplified and might not handle complex MultiPolygons correctly without recursion
        const stringifyCoords = (coords) => coords.map(ring => `(${ring.map(p => `${p[0]} ${p[1]} 0`).join(',')})`).join(',');
        if (finalGeometry.type === 'Polygon') {
            wkt = `POLYGON Z (${stringifyCoords(finalGeometry.coordinates)})`;
        } else {
            wkt = `MULTIPOLYGON Z (${finalGeometry.coordinates.map(poly => `(${stringifyCoords(poly)})`).join(',')})`;
        }
    }

    result.push({
        kecamatan: name,
        lokasi: wkt,
        id_kategori: "6",
        kategori: "Kecamatan"
    });
}

fs.writeFileSync('sidoarjo-kecamatan-new.json', JSON.stringify(result, null, 4));
console.log('Conversion complete. Saved to sidoarjo-kecamatan-new.json');
