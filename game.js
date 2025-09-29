const API_BASE = "https://api.hashequity.com/api";
let token = localStorage.getItem("token") || null;
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const objects = [
  { type: "Base", img: "images/HASH.png", value: 0.0000000100, chance: 0.8 },
  { type: "Blue", img: "images/HASHBlue.png", value: 0.0000000300, chance: 0.15 },
  { type: "Red", img: "images/HASHRed.png", value: 0.0000000500, chance: 0.04 },
  { type: "Gold", img: "images/HASHGold.png", value: 0.0000001000, chance: 0.009 },
  { type: "Rainbow", img: "images/HASHRainbow.png", value: 0.0000025000, chance: 0.001 }
];

let circles = [];

function pickObject() {
  const rand = Math.random();
  let cumulative = 0;
  for (const obj of objects) {
    cumulative += obj.chance;
    if (rand < cumulative) return obj;
  }
  return objects[0];
}

function spawnCircle() {
  if (circles.length >= 20) return;
  const obj = pickObject();
  const x = Math.random() * (canvas.width - 40) + 20;
  const y = Math.random() * (canvas.height - 40) + 20;
  const img = new Image();
  img.src = obj.img;
  circles.push({ x, y, r: 20, obj, img });
}

function drawCircles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  circles.forEach(c => {
    ctx.drawImage(c.img, c.x - c.r, c.y - c.r, c.r * 2, c.r * 2);
  });
}

canvas.addEventListener("click", async (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let i = 0; i < circles.length; i++) {
    const c = circles[i];
    const dx = x - c.x;
    const dy = y - c.y;
    if (Math.sqrt(dx * dx + dy * dy) < c.r) {
      circles.splice(i, 1);
      spawnCircle();

      if (token) {
        await fetch(`${API_BASE}/game/destroy`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token
          },
          body: JSON.stringify({ objectType: c.obj.type, hashValue: c.obj.value })
        });
        fetchBalances();
      }
      break;
    }
  }
});

async function fetchBalances() {
  if (!token) return;
  const res = await fetch(`${API_BASE}/game/balances`, {
    headers: { "Authorization": token }
  });
  const data = await res.json();
  if (res.ok) {
    document.getElementById("unminted").innerText = data.unmintedHash || 0;
    document.getElementById("hash").innerText = data.hashBalance || 0;
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

setInterval(drawCircles, 50);
setInterval(() => { if (circles.length < 20) spawnCircle(); }, 500);
