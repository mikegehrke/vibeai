document.getElementById("generate").onclick = async () => {
  const desc = document.getElementById("desc").value;
  const res = await fetch("http://localhost:8000/generate", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({description: desc})
  });
  const data = await res.json();
  document.getElementById("output").textContent =
    JSON.stringify(data, null, 2);
};
