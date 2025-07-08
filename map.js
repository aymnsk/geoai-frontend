// 🌍 Initialize map
const map = L.map("map").setView([28.75, 77.2], 11);

// 🗺️ Add base tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// 🔁 Global state
let geoJsonLayer = null;
let geoData = null;
let lastHighlight = null;

// 🔁 Load GeoJSON by city
function loadGeoJson(city) {
  const url = `https://aymnsk.github.io/geoai-frontend/data/${city}.geojson`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      geoData = data;

      if (geoJsonLayer) map.removeLayer(geoJsonLayer);

      geoJsonLayer = L.geoJSON(geoData, {
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          layer.bindPopup(
            `<b>${props.name}</b><br>Flood Risk: ${props.flood_risk}<br>Population: ${props.population}`
          );
        }
      }).addTo(map);

      const first = geoData.features[0];
      const [lng, lat] = first.geometry.coordinates;
      map.setView([lat, lng], 11);
    })
    .catch(err => {
      console.error("❌ Failed to load GeoJSON:", err);
      alert("Error loading zone data.");
    });
}

// 📍 Initial load (default to Delhi)
const citySelect = document.getElementById("city");
loadGeoJson(citySelect.value);

// 🎯 Reload on city change
citySelect.addEventListener("change", () => {
  loadGeoJson(citySelect.value);
});

// 🧠 Ask AI
document.getElementById("questionForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const city = citySelect.value;
  const question = document.getElementById("question").value.trim();
  const result = document.getElementById("result");
  result.innerText = "🧠 Thinking...";

  fetch("https://b6fb71eb-1f14-4fe4-a8ff-750b06611f40-00-312lb97pq5f33.sisko.replit.dev/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, city })
  })
    .then(res => res.json())
    .then(data => {
      const answer = data.answer || "❌ No response from AI.";
      result.innerText = answer;

      const match = answer.match(/Zone\s([A-Za-z0-9\s]+)/i);
      if (match && geoJsonLayer) {
        const zoneName = match[1].trim();

        geoJsonLayer.eachLayer(layer => {
          const props = layer.feature.properties;
          const coords = layer.feature.geometry.coordinates;

          if (props.name.toLowerCase() === zoneName.toLowerCase()) {
            const [lng, lat] = coords;

            if (lastHighlight) map.removeLayer(lastHighlight);

            lastHighlight = L.circleMarker([lat, lng], {
              radius: 10,
              color: "#00ff00",
              fillColor: "#00ff00",
              fillOpacity: 0.6
            })
              .addTo(map)
              .bindPopup(`✅ AI chose: ${props.name}`)
              .openPopup();

            map.setView([lat, lng], 13);
          }
        });
      }
    })
    .catch(err => {
      console.error("❌ Backend error:", err);
      result.innerText = "❌ Could not connect to backend.";
    });
});
