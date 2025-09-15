import folium

# Center point (your farm area)
center_lat, center_lon = 30.2753, 74.8746  

# Create map
m = folium.Map(location=[center_lat, center_lon], zoom_start=18, tiles=None)

# Add high-res ESRI imagery
folium.TileLayer(
    tiles="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attr="Esri World Imagery",
    name="Esri Satellite",
    overlay=False,
    control=False
).add_to(m)

# Enable coordinate popup on click
m.add_child(folium.LatLngPopup())

# Save map
m.save("farm_map.html")
print("✅ Map saved as farm_map.html. Open it in your browser.")
