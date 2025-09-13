🌍 Multispectral Remote Sensing Dataset for Soil & Crop Health Prediction
This dataset contains multispectral satellite-derived imagery represented through a variety of spectral indices and bands. Each index captures unique land, vegetation, water, or urban features. The dataset is designed for tasks like soil health prediction, crop monitoring, land cover classification, and time-series analysis.
📊 Spectral Indices & Bands
FALSECOLOR (False Color Composite)
Combines near-infrared (NIR), red, and green bands.
Healthy vegetation appears red, urban areas appear gray, and water appears dark.
Useful for distinguishing vegetation from built-up areas and water bodies.
NDSI (Normalized Difference Snow Index)
Detects snow and ice coverage by contrasting visible and shortwave infrared reflectance.
Used in snow melt studies, glacier monitoring, and seasonal hydrology.
NDBI (Normalized Difference Built-up Index)
Highlights urban and built-up areas using the contrast between SWIR and NIR bands.
Higher values → more developed/constructed regions.
NDWI (Normalized Difference Water Index)
Detects water bodies by differentiating water from vegetation and soil.
Higher values → stronger presence of surface water.
SWIR (Short-Wave Infrared Band)
Sensitive to moisture content in soil and vegetation.
Often used for drought monitoring, soil characterization, and vegetation stress analysis.
TCI (True Color Index)
Represents natural color imagery using red, green, and blue bands.
Provides a visual representation similar to what the human eye sees.
🗓️ Temporal Coverage
Each image is timestamped with acquisition date in format:
YYYY-MM-DD
Enables time-series analysis (seasonal crop growth, soil changes, water availability, etc.).
🏷️ Labels
Images are labeled using heuristic rules into categories based on vegetation health and soil/water conditions:
easy – clear vegetation/water/soil separation
medium – moderate complexity with mixed features
hard – complex regions (e.g., urban mix, drought stress, snow-water overlap)
🎯 Applications
This dataset can be applied in:
🌱 Crop Health Assessment – detect healthy vs stressed vegetation.
🏙️ Land Cover Classification – separate urban, vegetation, water, and barren land.
💧 Water Resource Monitoring – detect water bodies and seasonal changes.
❄️ Snow/Ice Monitoring – track snow melt and glacial retreat.
📈 Time-Series Analysis – use with machine learning models (e.g., LSTM, Random Forest) for soil health prediction and temporal trend analysis.
⚡ Note: The dataset has been structured for machine learning workflows. Features can be extracted (mean, median, std per index) and used as inputs for classification or regression tasks (e.g., soil health prediction).
