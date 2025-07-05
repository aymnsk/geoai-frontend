// 🌍 Initialize the map
var map = L.map('map').setView([28.75, 77.2], 11);

// 🗺️ Add base map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 📦 Load GeoJSON data from GitHub
fetch("https://aymnsk.github.io/geoai-frontend/zones.geojson")
  .then(response => response.json())
  .then(geojson => {
    // 🧩 Add features to map
    L.geoJSON(geojson, {
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

// 📤 Handle form and talk to AI backend
document.getElementById('questionForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const question = document.getElementById('question').value;
  const resultBox = document.getElementById('result');
  resultBox.innerText = "🧠 Thinking...";

  fetch("https://b6fb71eb-1f14-4fe4-a8ff-750b06611f40-00-312lb97pq5f33.sisko.replit.dev/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question: question })
  })
  .then(response => response.json())
  .then(data => {
    resultBox.innerText = data.answer || "❌ No response from AI";
  })
  .catch(error => {
    console.error("❌ Error:", error);
    resultBox.innerText = "❌ Failed to connect to backend.";
  });
});
