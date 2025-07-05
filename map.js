// 🌍 Initialize Leaflet map
const map = L.map('map').setView([28.75, 77.2], 11);

// 🗺️ Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let geoJsonLayer = null;
let geoData = null;
let lastHighlight = null;

// 📦 Load your zones.geojson from GitHub
fetch("https://aymnsk.github.io/geoai-frontend/zones.geojson")
  .then(response => response.json())
  .then(data => {
    geoData = data;

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
    console.error("❌ Error loading zones.geojson:", error);
    alert("Failed to load zone data.");
  });

// 🧠 Ask AI and highlight answer
document.getElementById("questionForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const question = document.getElementById("question").value.trim();
  const result = document.getElementById("result");
  result.innerText = "🧠 Thinking...";

  fetch("https://b6fb71eb-1f14-4fe4-a8ff-750b06611f40-00-312lb97pq5f33.sisko.replit.dev/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: question })
  })
    .then(res => res.json())
    .then(data => {
      const answer = data.answer || "❌ No answer from AI.";
      result.innerText = answer;

      const match = answer.match(/Zone\s([A-Z])/i);
      if (match && geoJsonLayer) {
        const zoneName = `Zone ${match[1].toUpperCase()}`;

        geoJsonLayer.eachLayer(layer => {
          const props = layer.feature.properties;
          if (props.name === zoneName) {
            const [lng, lat] = layer.feature.geometry.coordinates;

            if (lastHighlight) map.removeLayer(lastHighlight);

            lastHighlight = L.circleMarker([lat, lng], {
              radius: 12,
              color: "#00ff00",
              fillColor: "#00ff00",
              fillOpacity: 0.5
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
