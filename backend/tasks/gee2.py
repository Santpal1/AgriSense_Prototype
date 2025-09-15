import ee
import requests
import mysql.connector
from datetime import datetime, timedelta
from PIL import Image
import io

# -----------------------
# Initialize GEE
# -----------------------
ee.Initialize(project='farm-471814')

# -----------------------
# Config
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
    "password": "",
    "database": "satellite_data"
}

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
# Database save
# -----------------------
def save_stats(config, stats, timestamp):
    conn = mysql.connector.connect(**config)
    c = conn.cursor()
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
        stats.get("NDVI_mean"), stats.get("NDVI_median"), stats.get("NDVI_stdDev"),
        stats.get("NDWI_mean"), stats.get("NDWI_median"), stats.get("NDWI_stdDev"),
        stats.get("NDSI_mean"), stats.get("NDSI_median"), stats.get("NDSI_stdDev"),
        stats.get("SWIR_mean"), stats.get("SWIR_median"), stats.get("SWIR_stdDev"),
        stats.get("FalseColor_mean"), stats.get("FalseColor_median"), stats.get("FalseColor_stdDev"),
        stats.get("TCI_mean"), stats.get("TCI_median"), stats.get("TCI_stdDev")
    ))
    conn.commit()
    conn.close()
    print(f"✅ Stats saved for {timestamp}")

# -----------------------
# Backfill workflow
# -----------------------
def backfill_data(start_date, end_date, aoi, max_cloud=40, max_images=6):
    collection = (
        ee.ImageCollection("COPERNICUS/S2_SR")
        .filterBounds(aoi)
        .filterDate(start_date, end_date)
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", max_cloud))
        .sort("system:time_start", False)  # most recent first
    )

    size = collection.size().getInfo()
    if size == 0:
        print(f"⚠️ No images found between {start_date} and {end_date}")
        return

    images = collection.toList(size)
    count = min(size, max_images)

    for i in range(count):
        img = ee.Image(images.get(i))
        date_str = datetime.utcfromtimestamp(
            img.date().getInfo()["value"] / 1000
        ).strftime("%Y-%m-%d")

        img_with_indices = compute_indices(img)
        stats = reduce_stats(img_with_indices, aoi)
        save_stats(DB_CONFIG, stats, date_str)

# -----------------------
# Run once
# -----------------------
if __name__ == "__main__":
    # backfill data from August 20 to Sept 10 (adjust if needed)
    backfill_data("2025-01-01", "2025-09-10", AOI)
