document.getElementById('questionForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const question = document.getElementById('question').value;

  fetch("https://your-replit-name.replit.app/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question: question })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById('result').innerText = data.answer;
  })
  .catch(err => {
    document.getElementById('result').innerText = "Error contacting server";
  });
});
