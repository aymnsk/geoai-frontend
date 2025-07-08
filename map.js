// 🌍 Initialize the map
const map = L.map("map").setView([28.6139, 77.2090], 11); // Default to Delhi

// 🗺️ Add OpenStreetMap tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// 🌐 Global variables
let geoJsonLayer = null;
let geoData = null;
let lastHighlight = null;

// 🔄 Load geojson for selected city
function loadGeoJSON(city) {
  fetch(`https://aymnsk.github.io/geoai-frontend/data/${city}.geojson`)
    .then(res => res.json())
    .then(data => {
      geoData = data;

      if (geoJsonLayer) map.removeLayer(geoJsonLayer);

      geoJsonLayer = L.geoJSON(data, {
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          layer.bindPopup(
            `<b>${props.name}</b><br>Flood Risk: ${props.flood_risk}<br>Population: ${props.population}`
          );
        }
      }).addTo(map);

      const [lng, lat] = data.features[0].geometry.coordinates;
      map.setView([lat, lng], 11);
    })
    .catch(err => {
      console.error("❌ Failed to load GeoJSON:", err);
      alert("Failed to load zone data.");
    });
}

// ⬇️ On city change
document.getElementById("city").addEventListener("change", (e) => {
  const city = e.target.value;
  loadGeoJSON(city);
});

// 🧠 Submit question to AI
document.getElementById("questionForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const question = document.getElementById("question").value.trim();
  const city = document.getElementById("city").value;
  const result = document.getElementById("result");
  result.innerText = "🧠 Thinking...";

  fetch("https://b6fb71eb-1f14-4fe4-a8ff-750b06611f40-00-312lb97pq5f33.sisko.replit.dev/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, city })
  })
    .then(res => res.json())
    .then(data => {
      const answer = data.answer || "❌ No answer from AI.";
      result.innerText = answer;

      const match = answer.match(/Zone\s(.+)/i);
      if (match && geoJsonLayer) {
        const zoneName = match[1].trim().toUpperCase();

        geoJsonLayer.eachLayer(layer => {
          const props = layer.feature.properties;
          const coords = layer.feature.geometry.coordinates;

          if (props.name.toUpperCase() === zoneName) {
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
      result.innerText = "❌ Could not connect to GeoAI backend.";
    });
});

// 🔃 Initial load
loadGeoJSON("delhi");
