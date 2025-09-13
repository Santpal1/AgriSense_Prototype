# 🌍 Multispectral Remote Sensing Dataset for Soil & Crop Health Prediction

This dataset contains **multispectral satellite-derived imagery** represented through a variety of **spectral indices and bands**.  
Each index captures unique land, vegetation, water, or urban features.  

The dataset is designed for tasks like **soil health prediction, crop monitoring, land cover classification, and time-series analysis**.

---

## 📊 Spectral Indices & Bands

- **FALSECOLOR (False Color Composite)**  
  - Combines Near-Infrared (NIR), Red, and Green bands.  
  - Healthy vegetation → appears **red**.  
  - Urban areas → appear **gray**.  
  - Water → appears **dark/black**.  
  - Useful for **vegetation health detection** and separating water from land.  

- **NDSI (Normalized Difference Snow Index)**  
  - Detects **snow and ice** by contrasting Green and SWIR reflectance.  
  - Higher values → snow/ice presence.  
  - Lower values → bare soil, vegetation, or water.  
  - Applied in **snow melt studies and glacier monitoring**.  

- **NDBI (Normalized Difference Built-up Index)**  
  - Highlights **urban and built-up areas**.  
  - Computed using **SWIR and NIR bands**.  
  - Higher values → urban/built-up surfaces.  
  - Lower values → vegetation or water.  

- **NDWI (Normalized Difference Water Index)**  
  - Identifies **water bodies** using Green and NIR reflectance.  
  - Higher values → stronger water presence.  
  - Useful for **drought monitoring and surface water mapping**.  

- **SWIR (Short-Wave Infrared Band)**  
  - Sensitive to **moisture content** in soil and vegetation.  
  - Detects **plant water stress and drought**.  
  - Differentiates **dry vs moist soils**.  
  - Widely used in **soil health and vegetation stress studies**.  

- **TCI (True Color Index)**  
  - Standard **natural color imagery** using Red, Green, and Blue bands.  
  - Shows land surface as visible to the human eye.  
  - Useful for **visual interpretation** and quality checks.  

---

## 🗓️ Temporal Coverage

Each image is **timestamped** with acquisition date in format:  

YYYY-MM-DD


This enables **time-series analysis** (e.g., seasonal crop growth, soil moisture changes, snow cover variations).

---

## 🏷️ Labels

Images are categorized into classes based on vegetation health and land condition complexity:  

- `easy` – clear separation of vegetation, water, and soil.  
- `medium` – moderately mixed features (e.g., partial water stress, sparse vegetation).  
- `hard` – complex conditions (e.g., urban mix, drought stress, snow-water overlap).  

---

## 🎯 Applications

This dataset can be applied in:  

- 🌱 **Crop Health Assessment** – detecting stressed vs healthy vegetation.  
- 🏙️ **Land Cover Classification** – mapping urban, water, vegetation, and barren land.  
- 💧 **Water Resource Monitoring** – identifying surface water bodies and seasonal changes.  
- ❄️ **Snow & Ice Monitoring** – tracking snow melt and glacier retreat.  
- 📈 **Time-Series Analysis** – applying ML/DL models (e.g., LSTM, Random Forest) for soil health and vegetation trend prediction.  

---

⚡ **Note:**  
The dataset has been structured for **machine learning workflows**.  
Spectral features can be extracted (mean, median, standard deviation per index) and used for **classification or regression tasks** (e.g., soil health prediction).
