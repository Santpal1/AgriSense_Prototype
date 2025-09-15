import math
import requests
from PIL import Image
import io
import mercantile
import geopandas as gpd
from shapely.geometry import Polygon

# ----------------------------
# CONFIG
# ----------------------------
# Your farm polygon (10 acres approx)
coords = [
    [74.873908, 30.273958],
    [74.875227, 30.273958],
    [74.875227, 30.276705],
    [74.873908, 30.276705],
    [74.873908, 30.273958]
]

polygon = Polygon(coords)
gdf = gpd.GeoDataFrame(index=[0], crs="EPSG:4326", geometry=[polygon])

zoom = 18   # Try 18 first (fallback will handle issues)
output_file = "farm_image.png"

# ----------------------------
# TILE SOURCES
# ----------------------------
ESRI_URL = "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
GOOGLE_URL = "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"  # unofficial

def fetch_tile(x, y, z):
    """Fetch a tile, try ESRI first, then fallback to Google."""
    urls = [
        ESRI_URL.format(z=z, x=x, y=y),
        GOOGLE_URL.format(z=z, x=x, y=y)
    ]
    for url in urls:
        try:
            r = requests.get(url, timeout=20)
            r.raise_for_status()
            return Image.open(io.BytesIO(r.content))
        except Exception as e:
            print(f"Tile fetch failed at {url}, trying fallback...")
    return None

# ----------------------------
# BOUNDING BOX TO TILES
# ----------------------------
minx, miny, maxx, maxy = gdf.total_bounds
tiles = list(mercantile.tiles(minx, miny, maxx, maxy, zoom))

if not tiles:
    raise RuntimeError("No tiles found for this area. Try lowering zoom level.")

# ----------------------------
# STITCH TILES
# ----------------------------
tile_size = 256
min_tx = min(t.x for t in tiles)
max_tx = max(t.x for t in tiles)
min_ty = min(t.y for t in tiles)
max_ty = max(t.y for t in tiles)

width = (max_tx - min_tx + 1) * tile_size
height = (max_ty - min_ty + 1) * tile_size
stitched = Image.new("RGB", (width, height))

for t in tiles:
    img = fetch_tile(t.x, t.y, t.z)
    if img is None:
        continue
    x_offset = (t.x - min_tx) * tile_size
    y_offset = (t.y - min_ty) * tile_size
    stitched.paste(img, (x_offset, y_offset))

stitched.save(output_file)
print(f"✅ Stitched farm image saved as {output_file}")
