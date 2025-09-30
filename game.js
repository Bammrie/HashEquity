const API_BASE = "https://api.hashequity.com/api";
let walletAddress = localStorage.getItem("wallet");
document.getElementById("walletAddress").innerText = walletAddress;

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
  const r = Math.random() * 100;
  let sum = 0;
  for (let obj of OBJECTS) {
    sum += obj.rarity;
    if (r <= sum) return { ...obj };
  }
  return OBJECTS[0];
}

function spawnObject() {
  if (objectsOnScreen.length >= 20) return;
  const obj = pickObject();
  obj.x = Math.random() * (canvas.width - 50);
  obj.y = Math.random() * (canvas.height - 50);
  obj.size = 40;
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
      await fetch(`${API_BASE}/game/destroy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: walletAddress, objectId: o.id })
      });
      fetchBalances();
      break;
    }
  }
});

async function fetchBalances() {
  const res = await fetch(`${API_BASE}/game/balances?wallet=${walletAddress}`);
  const data = await res.json();
  document.getElementById("unminted").innerText = data.unmintedHash || 0;
  document.getElementById("hash").innerText = data.hashBalance || 0;
}

setInterval(spawnObject, 1000);
setInterval(drawObjects, 50);
fetchBalances();


// Loops
setInterval(spawnCircle, 1000);
setInterval(drawCircles, 50);
