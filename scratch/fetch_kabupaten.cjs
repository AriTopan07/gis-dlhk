// Fetch kabupaten boundary from Geoportal - merge all 18 kecamatan into a single boundary  
// OR use the kabupaten-level data if available
const https = require('https');
const fs = require('fs');
const path = require('path');

// We'll build the kabupaten boundary from the union of all kecamatan boundaries
// Since we already have the kecamatan data with clean WKT, let's use it
const kecData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'sidoarjo-kecamatan.json'), 'utf8'));

// Try to fetch kabupaten-level boundary from geoportal
const kabUrl = 'https://geoportal.sidoarjokab.go.id/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=geonode:administrasi_ar_kabupaten&outputFormat=application/json';

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

async function main() {
    // Try kabupaten layer first
    console.log('Trying to fetch kabupaten boundary from Geoportal...');
    try {
        const raw = await fetch(kabUrl);
        const geojson = JSON.parse(raw);
        
        if (geojson.features && geojson.features.length > 0) {
            console.log(`Found ${geojson.features.length} kabupaten features`);
            
            const result = geojson.features.map(f => {
                const name = f.properties.wadmkk || f.properties.namobj || 'Sidoarjo';
                // Convert geometry to WKT without Z
                const wkt = coordsToWKT(f.geometry);
                console.log(`  - ${name} (${f.geometry.type})`);
                return {
                    kecamatan: name,
                    lokasi: wkt,
                    id_kategori: "5",
                    kategori: "Kabupaten"
                };
            });
            
            const outputPath = path.join(__dirname, '..', 'public', 'data', 'sidoarjo.json');
            fs.writeFileSync(outputPath, JSON.stringify(result, null, 4), 'utf8');
            console.log(`Saved to ${outputPath}`);
            return;
        }
    } catch (e) {
        console.log('Kabupaten layer not found, trying alternative...');
    }
    
    // Try alternative layer names
    const alternatives = [
        'geonode:administrasi_ar_kabupaten_kota',
        'geonode:batas_kabupaten', 
        'geonode:kabupaten'
    ];
    
    for (const layer of alternatives) {
        try {
            const altUrl = `https://geoportal.sidoarjokab.go.id/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=${layer}&outputFormat=application/json`;
            console.log(`Trying layer: ${layer}...`);
            const raw = await fetch(altUrl);
            const geojson = JSON.parse(raw);
            if (geojson.features && geojson.features.length > 0) {
                console.log(`Found data in ${layer}`);
                // Process and save
                return;
            }
        } catch (e) {
            console.log(`  ${layer}: not available`);
        }
    }
    
    console.log('\nNo kabupaten boundary layer found. The current sidoarjo.json will be kept.');
    console.log('Note: The kecamatan boundaries are the authoritative data and have been updated.');
}

function coordsToWKT(geometry) {
    if (geometry.type === 'MultiPolygon') {
        const polys = geometry.coordinates.map(poly => {
            const rings = poly.map(ring => {
                return '(' + ring.map(coord => coord.slice(0, 2).join(' ')).join(', ') + ')';
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

main().catch(console.error);
