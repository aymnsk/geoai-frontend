// 🌍 Initialize map
var map = L.map('map').setView([28.75, 77.2], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 🌐 Global variable to hold GeoJSON data
let geoJsonLayer;
let geoData = null;

// 🔃 Load zones.geojson from GitHub and store
fetch("https://aymnsk.github.io/geoai-frontend/zones.geojson")
  .then(response => response.json())
  .then(geojson => {
    geoData = geojson; // Store for later use

    // Add features to map and store reference
    geoJsonLayer = L.geoJSON(geojson, {
      onEachFeature: function (feature, layer) {
        const props = feature.properties;
        layer.bindPopup(
          `<b>${props.name}</b><br>Flood Risk: ${props.flood_risk}<br>Population: ${props.population}`
        );
      }
    }).addTo(map);
  })
  .catch(err => {
    console.error("❌ Failed to load GeoJSON:", err);
  });

// 🚀 Send question to backend and highlight zone
document.getElementById('questionForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const question = document.getElementById('question').value;
  const resultBox = document.getElementById('result');
  resultBox.innerText = "🧠 Thinking...";

  fetch("https://b6fb71eb-1f14-4fe4-a8ff-750b06611f40-00-312lb97pq5f33.sisko.replit.dev/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: question })
  })
  .then(response => response.json())
  .then(data => {
    const answer = data.answer || "❌ No response from AI";
    resultBox.innerText = answer;

    // ✅ Highlight the recommended zone
    const match = answer.match(/Zone\s([A-Z])/i);
    if (match && geoData) {
      const targetName = `Zone ${match[1]}`;

      // Search GeoJSON features
      geoJsonLayer.eachLayer(layer => {
        const zoneName = layer.feature.properties.name;
        if (zoneName === targetName) {
          // 🔥 Highlight
          const coords = layer.feature.geometry.coordinates.reverse();
          L.circleMarker(coords, {
            radius: 12,
            color: "#00ff00",
            fillColor: "#00ff00",
            fillOpacity: 0.5
          }).addTo(map).bindPopup(`✅ Recommended: ${targetName}`).openPopup();
          map.setView(coords, 13);
        }
      });
    }
  })
  .catch(error => {
    console.error("❌ Error:", error);
    resultBox.innerText = "❌ Failed to connect to backend.";
  });
});
