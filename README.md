# 🌍 Multispectral Remote Sensing Dataset for Soil & Crop Health Prediction

This dataset features **multispectral satellite imagery** represented by a variety of **spectral indices and bands**.  
Each index captures unique aspects of land, vegetation, water, or urban features.

Designed for tasks such as **soil health prediction, crop monitoring, land cover classification, and time-series analysis**.

---

## 📊 Spectral Indices & Bands

- **FALSECOLOR (False Color Composite)**  
  - Combines Near-Infrared (NIR), Red, and Green bands.  
  - Healthy vegetation appears **red**.  
  - Urban areas appear **gray**.  
  - Water appears **dark/black**.  
  - Useful for **vegetation health detection** and separating water from land.

- **NDSI (Normalized Difference Snow Index)**  
  - Detects **snow and ice** by contrasting Green and SWIR reflectance.  
  - Higher values indicate snow/ice presence.  
  - Lower values indicate bare soil, vegetation, or water.  
  - Applied in **snow melt studies and glacier monitoring**.

- **NDBI (Normalized Difference Built-up Index)**  
  - Highlights **urban and built-up areas**.  
  - Computed using **SWIR and NIR bands**.  
  - Higher values indicate urban/built-up surfaces.  
  - Lower values indicate vegetation or water.

- **NDWI (Normalized Difference Water Index)**  
  - Identifies **water bodies** using Green and NIR reflectance.  
  - Higher values indicate stronger water presence.  
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

Each image is **timestamped** with acquisition date in the format:  
`YYYY-MM-DD`

This enables **time-series analysis** (e.g., seasonal crop growth, soil moisture changes, snow cover variations).

---

## 🏷️ Labels

Images are categorized into classes based on vegetation health and land condition complexity:

- `easy` – clear separation of vegetation, water, and soil  
- `medium` – moderately mixed features (e.g., partial water stress, sparse vegetation)  
- `hard` – complex conditions (e.g., urban mix, drought stress, snow-water overlap)  

---

## 🎯 Applications

This dataset can be used for:

- 🌱 **Crop Health Assessment** – detecting stressed vs healthy vegetation  
- 🏙️ **Land Cover Classification** – mapping urban, water, vegetation, and barren land  
- 💧 **Water Resource Monitoring** – identifying surface water bodies and seasonal changes  
- ❄️ **Snow & Ice Monitoring** – tracking snow melt and glacier retreat  
- 📈 **Time-Series Analysis** – applying ML/DL models (e.g., LSTM, Random Forest) for soil health and vegetation trend prediction  

---

**Note:**  
The dataset is structured for **machine learning workflows**.  
Spectral features (mean, median, standard deviation per index) can be extracted and used for **classification or regression tasks** (e.g., soil health prediction).

---

## 🚀 Getting Started

To run the project:

1. Create a `.env` file in the `prototype` folder with:  
   `VITE_API_URL=http://localhost:5000` (or your backend URL)
2. Download models from:  
   [Google Drive Models](https://drive.google.com/drive/folders/1ooejTThXPClCx7iRPKCIlsl9SsusYMhw?usp=sharing)
3. Place the models in `backend/models`
4. Download the database and import it into XAMPP Control Panel or any MySQL Server.
5. In the terminal:  
   `cd backend`  
   `pip install -r ../requirements.txt`  
   `python app.py`
6. In another terminal:  
   `cd prototype`  
   `npm i`  
   `npm run dev`

Enjoy exploring and analyzing multispectral satellite data for soil and crop health!
