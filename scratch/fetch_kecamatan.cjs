// Fetch all 18 kecamatan from Geoportal and convert to our WKT format
const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://geoportal.sidoarjokab.go.id/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=geonode:administrasi_ar_kecamatan&outputFormat=application/json';

function fetch(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { rejectUnauthorized: false }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', reject);
        }).on('error', reject);
    });
}

function coordsToWKT(geometry) {
    if (geometry.type === 'MultiPolygon') {
        const polys = geometry.coordinates.map(poly => {
            const rings = poly.map(ring => {
                return '(' + ring.map(coord => {
                    // coord is [lon, lat, z] or [lon, lat]
                    return coord.slice(0, 2).join(' ');
                }).join(', ') + ')';
            });
            return '(' + rings.join(', ') + ')';
        });
        return 'MULTIPOLYGON (' + polys.join(', ') + ')';
    } else if (geometry.type === 'Polygon') {
        const rings = geometry.coordinates.map(ring => {
            return '(' + ring.map(coord => coord.slice(0, 2).join(' ')).join(', ') + ')';
        });
        return 'POLYGON (' + rings.join(', ') + ')';
    }
    return null;
}

async function main() {
    console.log('Fetching kecamatan data from Geoportal...');
    const raw = await fetch(url);
    const geojson = JSON.parse(raw);
    
    console.log(`Total features: ${geojson.totalFeatures}`);
    console.log(`Received features: ${geojson.features.length}`);
    
    const result = geojson.features.map(f => {
        const name = f.properties.wadmkc || f.properties.namobj;
        const wkt = coordsToWKT(f.geometry);
        console.log(`  - ${name} (${f.geometry.type}, ${f.geometry.coordinates.length} polygons)`);
        return {
            kecamatan: name,
            lokasi: wkt,
            id_kategori: "6",
            kategori: "Kecamatan"
        };
    });
    
    const outputPath = path.join(__dirname, '..', 'public', 'data', 'sidoarjo-kecamatan.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 4), 'utf8');
    console.log(`\nSaved ${result.length} kecamatan to ${outputPath}`);
    
    // Verify
    const verify = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    console.log(`\nVerification: ${verify.length} kecamatan loaded`);
    verify.forEach(k => {
        const hasZ = /POLYGON\s+Z/i.test(k.lokasi);
        console.log(`  ${k.kecamatan}: WKT starts with "${k.lokasi.substring(0, 20)}..." ${hasZ ? '⚠️ HAS Z' : '✅ NO Z'}`);
    });
}

main().catch(console.error);
