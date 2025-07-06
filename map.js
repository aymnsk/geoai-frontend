// 🌍 Initialize the map
const map = L.map('map').setView([28.75, 77.2], 11);

// 🗺️ Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 🌐 Global state
let geoJsonLayer = null;
let geoData = null;
let lastHighlight = null;

// 📦 Load zones.geojson from GitHub Pages
"fetch("https://raw.githubusercontent.com/aymnsk/geoai-frontend/main/data/zones.geojson")
  .then(response => response.json())
  .then(data => {
    geoData = data;

    // Display all zones
    geoJsonLayer = L.geoJSON(geoData, {
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        layer.bindPopup(
          `<b>${props.name}</b><br>Flood Risk: ${props.flood_risk}<br>Population: ${props.population}`
        );
      }
    }).addTo(map);
  })
  .catch(error => {
    console.error("❌ Failed to load GeoJSON:", error);
    alert("Error loading zone data");
  });

// 🧠 Handle AI query
document.getElementById("questionForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const question = document.getElementById("question").value.trim();
  const result = document.getElementById("result");
  result.innerText = "🧠 Thinking...";

  fetch("https://b6fb71eb-1f14-4fe4-a8ff-750b06611f40-00-312lb97pq5f33.sisko.replit.dev/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  })
    .then(res => res.json())
    .then(data => {
      const answer = data.answer || "❌ No answer from AI.";
      result.innerText = answer;

      // Highlight zone if mentioned in response (e.g., "Zone C")
      const match = answer.match(/Zone\s([A-Z])/i);
      if (match && geoJsonLayer) {
        const zoneName = `Zone ${match[1].toUpperCase()}`;

        geoJsonLayer.eachLayer(layer => {
          const props = layer.feature.properties;
          const coords = layer.feature.geometry.coordinates;

          if (props.name === zoneName) {
            const [lng, lat] = coords;

            if (lastHighlight) map.removeLayer(lastHighlight);

            lastHighlight = L.circleMarker([lat, lng], {
              radius: 10,
              color: "#00ff00",
              fillColor: "#00ff00",
              fillOpacity: 0.6
            }).addTo(map).bindPopup(`✅ AI chose: ${zoneName}`).openPopup();

            map.setView([lat, lng], 13);
          }
        });
      }
    })
    .catch(err => {
      console.error("❌ Backend error:", err);
      result.innerText = "❌ Failed to connect to AI backend.";
    });
});
