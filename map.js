// 🌍 Initialize map
const map = L.map("map").setView([28.75, 77.2], 11);

// 🗺️ Add base map layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// 🔁 Global state
let geoJsonLayer = null;
let geoData = null;
let lastHighlight = null;

// 📦 Load GeoJSON from GitHub Pages
fetch("https://aymnsk.github.io/geoai-frontend/data/zones.geojson")
  .then(res => res.json())
  .then(data => {
    geoData = data;

    // 🎯 Draw zones
    geoJsonLayer = L.geoJSON(geoData, {
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        layer.bindPopup(
          `<b>${props.name}</b><br>Flood Risk: ${props.flood_risk}<br>Population: ${props.population}`
        );
      }
    }).addTo(map);
  })
  .catch(err => {
    console.error("❌ Failed to load GeoJSON:", err);
    alert("Error loading zone data");
  });

// 🧠 Submit question to AI
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
      const answer = data.answer || "❌ No response from AI.";
      result.innerText = answer;

      // 🔍 Parse zone from answer
      const match = answer.match(/Zone\s([A-Z])/i);
      if (match && geoJsonLayer) {
        const zoneName = `Zone ${match[1].toUpperCase()}`;

        geoJsonLayer.eachLayer(layer => {
          const props = layer.feature.properties;
          const coords = layer.feature.geometry.coordinates;

          if (props.name === zoneName) {
            const [lng, lat] = coords;

            // 💡 Highlight the selected zone
            if (lastHighlight) map.removeLayer(lastHighlight);

            lastHighlight = L.circleMarker([lat, lng], {
              radius: 10,
              color: "#00ff00",
              fillColor: "#00ff00",
              fillOpacity: 0.6
            })
              .addTo(map)
              .bindPopup(`✅ AI chose: ${zoneName}`)
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
