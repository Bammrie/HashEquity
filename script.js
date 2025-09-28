const API_URL = "https://hash-backend-production.up.railway.app";
let token = null;
let score = 0;

function signup() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  }).then(r => r.json()).then(data => {
    alert(data.message || "Signup complete");
  });
}

function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  }).then(r => r.json()).then(data => {
    if (data.token) {
      token = data.token;
      document.getElementById('auth').style.display = 'none';
      document.getElementById('userInfo').style.display = 'block';
      document.getElementById('userEmail').innerText = data.email;
      document.getElementById('unmintedHash').innerText = data.unmintedHash;
      document.getElementById('hashBalance').innerText = data.hashBalance;
    } else {
      alert(data.message || "Login failed");
    }
  });
}

function destroyObject() {
  if (!token) return;

  fetch(`${API_URL}/destroy`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  }).then(r => r.json()).then(data => {
    if (data.unmintedHash !== undefined) {
      score++;
      document.getElementById('score').innerText = score;
      document.getElementById('unmintedHash').innerText = data.unmintedHash;
    }
  });
}

// Game rendering
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let objects = [];

function spawnObject() {
  const x = Math.random() * (canvas.width - 20);
  const y = Math.random() * (canvas.height - 20);
  objects.push({ x, y, size: 20 });
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  objects.forEach((obj, i) => {
    if (mouseX >= obj.x && mouseX <= obj.x + obj.size &&
        mouseY >= obj.y && mouseY <= obj.y + obj.size) {
      objects.splice(i, 1);
      destroyObject();
    }
  });
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "lime";
  objects.forEach(obj => {
    ctx.beginPath();
    ctx.arc(obj.x, obj.y, obj.size / 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

setInterval(spawnObject, 1000);
setInterval(draw, 30);

// Countdown timer
function updateCountdown() {
  const now = new Date();
  const nextMint = new Date();
  nextMint.setUTCHours(24, 0, 0, 0);

  const diff = nextMint - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  document.getElementById('countdown').innerText =
    `${hours}h ${minutes}m ${seconds}s`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

