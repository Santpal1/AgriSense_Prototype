The dataset we are using contains multispectral remote sensing images derived from satellite imagery, represented through several spectral indices and bands. Each index captures specific characteristics of the land, water, vegetation, or urban surfaces:
FALSECOLOR – Combines near-infrared, red, and green bands to highlight vegetation and water features. Healthy vegetation appears red, urban areas gray, and water dark.
NDSI (Normalized Difference Snow Index) – Detects snow and ice coverage by contrasting visible and shortwave infrared reflectance. Useful in monitoring snow melt and glacier areas.
NDBI (Normalized Difference Built-up Index) – Highlights urban and built-up areas by contrasting SWIR and NIR bands. Higher values indicate more developed or constructed regions.
NDWI (Normalized Difference Water Index) – Detects water bodies by differentiating water from vegetation and soil. High values indicate presence of water.
SWIR (Short-Wave Infrared Band) – Sensitive to moisture content, soil, and vegetation water stress. Often used for drought monitoring and soil characterization.
TCI (True Color Index) – Represents natural color imagery using red, green, and blue bands, giving a standard visual representation of the land surface.
Additional Info:
Images are timestamped (YYYY-MM-DD) for temporal analysis.
Each image is labeled based on vegetation health, water content, and land conditions using heuristic rules (easy, medium, hard).
Suitable for tasks like crop health assessment, land cover classification, and time-series analysis using machine learning models (e.g., LSTM).
