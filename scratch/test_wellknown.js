import wellknown from 'wellknown';

const wkt = "MULTIPOLYGON Z (((112.8031668 -7.47934325999995 0, 112.8031668 -7.47934325999995 0)))";
try {
    const geo = wellknown.parse(wkt);
    console.log("Parsed:", !!geo);
    console.log("Coordinates:", geo ? geo.coordinates : "null");
} catch (e) {
    console.error("Error:", e.message);
}
