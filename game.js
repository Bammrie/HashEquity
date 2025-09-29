const API_BASE = "https://api.hashequity.com/api";
let token = localStorage.getItem("token") || null;

// --- Auth ---
async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (res.ok) {
    token = data.token;
    localStorage.setItem("token", token);
    showUserPanel(data.email);
    alert(data.message);
  } else {
    alert(data.error || "Signup failed");
  }
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (res.ok) {
    token = data.token;
    localStorage.setItem("token", token);
    showUserPanel(data.email);
    fetchBalances();
    alert(data.message);
  } else {
    alert(data.error || "Login failed");
  }
}

async function fetchBalances() {
  if (!token) return;
  const res = await fetch(`${API_BASE}/game/balances`, {
    headers: { Authorization: token },
  });
  const data = await res.json();
  if (res.ok) {
    document.getElementById("unminted").innerText = data.unmintedHash || 0;
    document.getElementById("hash").innerText = data.hashBalance || 0;
  }
}

function showUserPanel(email) {
  document.getElementById("auth").style.display = "none";
  document.getElementById("userPanel").style.display = "block";
  document.getElementById("userEmail").innerText = email;
  fetchBalances();
}

function logout() {
  localStorage.removeItem("token");
  token = null;
  document.getElementById("auth").style.display = "block";
  document.getElementById("userPanel").style.display = "none";
}

// --- Countdown ---
function startCountdown() {
  function updateCountdown() {
    const now = new Date();
    const nextMint = new Date();
    nextMint.setUTCHours(24, 0, 0, 0);
    const diff = nextMint - now;
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    document.getElementById("countdown").innerText =
      `Next Mint in ${hours}h ${minutes}m ${seconds}s`;
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);
}
startCountdown();

// --- Game ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const coinTypes = [
  { image: "HASH.png", value: 0.0000000100, chance: 0.8 },
  { image: "HASHBlue.png", value: 0.0000000300, chance: 0.15 },
  { image: "HASHRed.png", value: 0.0000000500, chance: 0.04 },
  { image: "HASHGold.png", value: 0.0000001000, chance: 0.009 },
  { image: "HASHRainbow.png", value: 0.0000025000, chance: 0.001 },
];

let objects = [];

function chooseCoin() {
  let r = Math.random();
  let cumulative = 0;
  for (let coin of coinTypes) {
    cumulative += coin.chance;
    if (r <= cumulative) return coin;
  }
  return coinTypes[0];
}

function spawnObject() {
  const coin = chooseCoin();
  const x = Math.random() * (canvas.width - 30) + 15;
  const y = Math.random() * (canvas.height - 30) + 15;
  objects.push({ x, y, r: 15, coin });
}

function drawObjects() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  objects.forEach(obj => {
    const img = new Image();
    img.src = obj.coin.image;
    ctx.drawImage(img, obj.x - obj.r, obj.y - obj.r, obj.r * 2, obj.r * 2);
  });
}

canvas.addEventListener("click", async (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];
    if (Math.sqrt((x - obj.x) ** 2 + (y - obj.y) ** 2) < obj.r) {
      objects.splice(i, 1);
      if (token) {
        await fetch(`${API_BASE}/game/destroy`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify({ value: obj.coin.value }),
        });
        fetchBalances();
      }
      break;
    }
  }
});

function gameLoop() {
  if (objects.length < 20) {
    spawnObject();
  }
  drawObjects();
}

setInterval(gameLoop, 200);
