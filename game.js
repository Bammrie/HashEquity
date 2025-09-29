const API_BASE = "https://api.hashequity.com/api";
let token = localStorage.getItem("token") || null;

// --- Auth (same as before) ---
async function signup() { /* unchanged */ }
async function login() { /* unchanged */ }
async function fetchBalances() { /* unchanged */ }
function showUserPanel(email) { /* unchanged */ }
function logout() { /* unchanged */ }

// --- Countdown (same as before) ---
function startCountdown() { /* unchanged */ }
startCountdown();

// --- Game ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ✅ Preload images
const coinTypes = [
  { src: "HASH.png", value: 0.0000000100, chance: 0.8 },
  { src: "HASHBlue.png", value: 0.0000000300, chance: 0.15 },
  { src: "HASHRed.png", value: 0.0000000500, chance: 0.04 },
  { src: "HASHGold.png", value: 0.0000001000, chance: 0.009 },
  { src: "HASHRainbow.png", value: 0.0000025000, chance: 0.001 },
];

coinTypes.forEach(c => {
  const img = new Image();
  img.src = c.src;
  c.image = img; // attach loaded image
});

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
    ctx.drawImage(obj.coin.image, obj.x - obj.r, obj.y - obj.r, obj.r * 2, obj.r * 2);
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
  while (objects.length < 20) {
    spawnObject();
  }
  drawObjects();
}

setInterval(gameLoop, 200);

