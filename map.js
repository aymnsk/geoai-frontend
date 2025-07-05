// 🌍 Initialize map
var map = L.map('map').setView([28.75, 77.2], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 🧠 Store map data + layer reference
let geoJsonLayer = null;
let geoData = null;
let lastHighlight = null;

// 🔃 Load GeoJSON
fetch("https://aymnsk.github.io/geoai-frontend/zones.geojson")
  .then(res => res.json())
  .then(json => {
    geoData = json;

    geoJsonLayer = L.geoJSON(json, {
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        layer.bindPopup(
          `<b>${props.name}</b><br>Flood Risk: ${props.flood_risk}<br>Population: ${props.population}`
        );
      }
    }).addTo(map);
  })
  .catch(err => {
    console.error("❌ Failed to load zones:", err);
  });

// 🧠 Ask AI and highlight answer
document.getElementById('questionForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const question = document.getElementById('question').value;
  const result = document.getElementById('result');
  result.innerText = "🧠 Thinking...";

  fetch("https://b6fb71eb-1f14-4fe4-a8ff-750b06611f40-00-312lb97pq5f33.sisko.replit.dev/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  })
  .then(res => res.json())
  .then(data => {
    const answer = data.answer || "❌ No answer.";
    result.innerText = answer;

    // 🧠 Try to extract "Zone X"
    const match = answer.match(/Zone\s([A-Z])/);
    if (match && geoJsonLayer) {
      const zoneName = `Zone ${match[1]}`;

      geoJsonLayer.eachLayer(layer => {
        if (layer.feature.properties.name === zoneName) {
          const [lng, lat] = layer.feature.geometry.coordinates;

          if (lastHighlight) map.removeLayer(lastHighlight);
          lastHighlight = L.circleMarker([lat, lng], {
            radius: 12,
            color: "#00ff00",
            fillColor: "#00ff00",
            fillOpacity: 0.5
          }).addTo(map).bindPopup(`✅ AI chose ${zoneName}`).openPopup();

          map.setView([lat, lng], 13);
        }
      });
    }
  })
  .catch(err => {
    console.error("❌ Error:", err);
    result.innerText = "❌ Error contacting backend.";
  });
});
