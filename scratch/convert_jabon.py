import json
import os

geojson_path = r'C:\Users\arito\.gemini\antigravity\brain\4be4c091-c9f8-4b25-ab47-ab1d50c52025\.system_generated\steps\467\content.md'

with open(geojson_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()
    # Find the line that looks like JSON (starts with {"type")
    json_str = next(line for line in lines if line.strip().startswith('{"type"'))
    data = json.loads(json_str)

coords = data['coordinates'][0][0]
wkt_points = [f"{c[0]} {c[1]} 0" for c in coords]
wkt_str = "MULTIPOLYGON Z (((" + ",".join(wkt_points) + ")))"

print(wkt_str)
