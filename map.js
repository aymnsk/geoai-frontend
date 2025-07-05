// Initialize the map
var map = L.map('map').setView([28.7, 77.1], 11);

// Add OpenStreetMap base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Sample zone data (same as backend, ideally fetched from backend in future)
const zones = [
  { name: "Zone A", coords: [28.7, 77.1], color: 'green' },
  { name: "Zone B", coords: [28.8, 77.2], color: 'red' },
  { name: "Zone C", coords: [28.75, 77.15], color: 'blue' }
];

// Place markers on map
zones.forEach(zone => {
  L.marker(zone.coords)
    .addTo(map)
    .bindPopup(zone.name);
});

// Handle form submission
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
    console.error("Error:", error);
    resultBox.innerText = "❌ Failed to connect to backend.";
  });
});
