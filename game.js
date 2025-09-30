const API_BASE = "https://hash-backend-production.up.railway.app/api";
const walletAddress = localStorage.getItem("wallet");

if (!walletAddress) {
  window.location.href = "/";
} else {
  document.getElementById("walletAddress").innerText = walletAddress;
}

// Countdown
function startCountdown() {
  function update() {
    const now = new Date();
    const nextMint = new Date();
    nextMint.setUTCHours(24, 0, 0, 0);
    const diff = nextMint - now;
    const h = Math.floor(diff / 1000 / 60 / 60);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);
    document.getElementById("countdown").innerText = `Next Mint in ${h}h ${m}m ${s}s`;
  }
  update();
  setInterval(update, 1000);
}
startCountdown();

// Game setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let objectsOnScreen = [];

function pickObject() {
  const totalChance = OBJECTS.reduce((sum, obj) => sum + obj.chance, 0);
  const r = Math.random() * totalChance;
  let sum = 0;
  for (const obj of OBJECTS) {
    sum += obj.chance;
    if (r <= sum) {
      return { ...obj };
    }
  }
  return { ...OBJECTS[0] };
}

function spawnObject() {
  if (objectsOnScreen.length >= 20) return;
  const obj = pickObject();
  const size = 40;
  const maxX = canvas.width - size;
  const maxY = canvas.height - size;
  obj.x = Math.random() * maxX;
  obj.y = Math.random() * maxY;
  obj.size = size;
  const img = new Image();
  img.src = obj.image;
  obj.img = img;
  objectsOnScreen.push(obj);
}

function drawObjects() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  objectsOnScreen.forEach(o => {
    ctx.drawImage(o.img, o.x, o.y, o.size, o.size);
  });
}

canvas.addEventListener("click", async e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  for (let i = 0; i < objectsOnScreen.length; i++) {
    const o = objectsOnScreen[i];
    if (x >= o.x && x <= o.x + o.size && y >= o.y && y <= o.y + o.size) {
      objectsOnScreen.splice(i, 1);
      spawnObject();
      if (walletAddress) {
        try {
          await fetch(`${API_BASE}/game/destroy`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wallet: walletAddress, objectId: o.id })
          });
          fetchBalances();
        } catch (err) {
          console.error("Failed to report destroy", err);
        }
      }
      break;
    }
  }
});

async function fetchBalances() {
  if (!walletAddress) return;
  try {
    const res = await fetch(`${API_BASE}/game/balances?wallet=${walletAddress}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    document.getElementById("unminted").innerText = data.unmintedHash ?? 0;
    document.getElementById("hash").innerText = data.hashBalance ?? 0;
  } catch (err) {
    console.error("Failed to load balances", err);
  }
}

for (let i = 0; i < 5; i++) {
  spawnObject();
}
setInterval(spawnObject, 1000);
setInterval(drawObjects, 50);
drawObjects();
fetchBalances();
