document.getElementById('questionForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const question = document.getElementById('question').value;

  // 🔗 Replace this with your real Replit backend URL
  const backendURL = "https://b6fb71eb-1f14-4fe4-a8ff-750b06611f40-00-312lb97pq5f33.sisko.replit.dev/ask";

  // Show loading
  document.getElementById('result').innerText = "Thinking...";

  fetch(backendURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question: question })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById('result').innerText = data.answer || "No answer returned.";
  })
  .catch(err => {
    document.getElementById('result').innerText = "❌ Error talking to backend.";
    console.error("Error:", err);
  });
});
