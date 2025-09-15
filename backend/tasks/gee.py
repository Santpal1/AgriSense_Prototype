import ee
import numpy as np
from PIL import Image
import io
import requests
import mysql.connector
from datetime import datetime

# -----------------------
# Initialize GEE with your project
# -----------------------
ee.Initialize(project='farm-471814')

# -----------------------
# User Config
# -----------------------
AOI_COORDS = [[
    [74.873908, 30.273958],
    [74.875227, 30.273958],
    [74.875227, 30.276705],
    [74.873908, 30.276705],
    [74.873908, 30.273958]
]]
AOI = ee.Geometry.Polygon(AOI_COORDS)
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",  # set your MySQL password here
    "database": "satellite_data"
}
IMAGE_SAVE_PATH = "../static/latest_truecolor.jpg"

# -----------------------
# Function to fetch latest Sentinel-2 image
# -----------------------
def get_latest_sentinel_image(aoi, max_cloud=20):
    collection = (
        ee.ImageCollection("COPERNICUS/S2_SR")
        .filterBounds(aoi)
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", max_cloud))
        .sort("system:time_start", False)
    )
    latest = collection.first()
    return latest

# -----------------------
# Compute indices
# -----------------------
def compute_indices(image):
    ndvi = image.normalizedDifference(["B8", "B4"]).rename("NDVI")
    ndwi = image.normalizedDifference(["B3", "B8"]).rename("NDWI")
    ndsi = image.normalizedDifference(["B3", "B11"]).rename("NDSI")
    swir = image.select("B11").rename("SWIR")
    false_color = image.expression(
        "(B8 - B4) / (B8 + B4)", {"B8": image.select("B8"), "B4": image.select("B4")}
    ).rename("FalseColor")
    tci = image.expression(
        "((B3 - B2) / (B3 + B2)) * 0.2", {"B2": image.select("B2"), "B3": image.select("B3")}
    ).rename("TCI")

    return image.addBands([ndvi, ndwi, ndsi, swir, false_color, tci])

# -----------------------
# Reduce indices over AOI
# -----------------------
def reduce_stats(image, aoi):
    bands = ["NDVI", "NDWI", "NDSI", "SWIR", "FalseColor", "TCI"]
    reducers = ee.Reducer.mean().combine(ee.Reducer.median(), "", True).combine(ee.Reducer.stdDev(), "", True)
    stats = image.select(bands).reduceRegion(
        reducer=reducers, geometry=aoi, scale=10, maxPixels=1e9
    ).getInfo()
    return stats

# -----------------------
# Save True Color image
# -----------------------
def save_truecolor(image, aoi, path, scale=10):
    url = image.visualize(bands=["B4", "B3", "B2"], min=0, max=3000).getThumbURL({
        "region": aoi,
        "dimensions": 512
    })
    response = requests.get(url)
    img = Image.open(io.BytesIO(response.content))
    if img.mode == "RGBA":
        img = img.convert("RGB")
    img.save(path)
    print(f"True color image saved to {path}")

# -----------------------
# Database functions
# -----------------------
def init_db(config):
    conn = mysql.connector.connect(**config)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS crop_stats (
            timestamp VARCHAR(20) PRIMARY KEY,
            NDVI_mean DOUBLE, NDVI_median DOUBLE, NDVI_std DOUBLE,
            NDWI_mean DOUBLE, NDWI_median DOUBLE, NDWI_std DOUBLE,
            NDSI_mean DOUBLE, NDSI_median DOUBLE, NDSI_std DOUBLE,
            SWIR_mean DOUBLE, SWIR_median DOUBLE, SWIR_std DOUBLE,
            FalseColor_mean DOUBLE, FalseColor_median DOUBLE, FalseColor_std DOUBLE,
            TCI_mean DOUBLE, TCI_median DOUBLE, TCI_std DOUBLE
        )
    """)
    conn.commit()
    conn.close()

def save_stats(config, stats):
    conn = mysql.connector.connect(**config)
    c = conn.cursor()
    timestamp = datetime.now().strftime("%Y-%m-%d")
    sql = """
        INSERT INTO crop_stats (
            timestamp,
            NDVI_mean, NDVI_median, NDVI_std,
            NDWI_mean, NDWI_median, NDWI_std,
            NDSI_mean, NDSI_median, NDSI_std,
            SWIR_mean, SWIR_median, SWIR_std,
            FalseColor_mean, FalseColor_median, FalseColor_std,
            TCI_mean, TCI_median, TCI_std
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        ON DUPLICATE KEY UPDATE
            NDVI_mean=VALUES(NDVI_mean), NDVI_median=VALUES(NDVI_median), NDVI_std=VALUES(NDVI_std),
            NDWI_mean=VALUES(NDWI_mean), NDWI_median=VALUES(NDWI_median), NDWI_std=VALUES(NDWI_std),
            NDSI_mean=VALUES(NDSI_mean), NDSI_median=VALUES(NDSI_median), NDSI_std=VALUES(NDSI_std),
            SWIR_mean=VALUES(SWIR_mean), SWIR_median=VALUES(SWIR_median), SWIR_std=VALUES(SWIR_std),
            FalseColor_mean=VALUES(FalseColor_mean), FalseColor_median=VALUES(FalseColor_median), FalseColor_std=VALUES(FalseColor_std),
            TCI_mean=VALUES(TCI_mean), TCI_median=VALUES(TCI_median), TCI_std=VALUES(TCI_std)
    """
    c.execute(sql, (
        timestamp,
        stats["NDVI_mean"], stats["NDVI_median"], stats["NDVI_stdDev"],
        stats["NDWI_mean"], stats["NDWI_median"], stats["NDWI_stdDev"],
        stats["NDSI_mean"], stats["NDSI_median"], stats["NDSI_stdDev"],
        stats["SWIR_mean"], stats["SWIR_median"], stats["SWIR_stdDev"],
        stats["FalseColor_mean"], stats["FalseColor_median"], stats["FalseColor_stdDev"],
        stats["TCI_mean"], stats["TCI_median"], stats["TCI_stdDev"]
    ))
    conn.commit()
    conn.close()
    print(f"Stats saved to database with timestamp {timestamp}")

# -----------------------
# Main workflow
# -----------------------
def main():
    init_db(DB_CONFIG)
    latest = get_latest_sentinel_image(AOI)
    image_with_indices = compute_indices(latest)
    stats = reduce_stats(image_with_indices, AOI)
    save_truecolor(latest, AOI, IMAGE_SAVE_PATH)
    save_stats(DB_CONFIG, stats)

if __name__ == "__main__":
    main()
