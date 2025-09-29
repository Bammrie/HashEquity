const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let circles = [];
let score = 0;

// 🎲 Utility: pick random object by chance
function getRandomObject() {
  const roll = Math.random() * 100;
  let cumulative = 0;
  for (const obj of gameObjects) {
    cumulative += obj.chance;
    if (roll <= cumulative) return obj;
  }
  return gameObjects[0]; // fallback
}

// ✅ Spawn capped at 20
function spawnCircle() {
  if (circles.length >= 20) return;
  const obj = getRandomObject();
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  circles.push({ ...obj, x, y, r: 20 });
  logSpawn(obj.id);
}

// Draw objects
function drawCircles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  circles.forEach(c => {
    const img = new Image();
    img.src = c.image;
    ctx.drawImage(img, c.x - c.r, c.y - c.r, c.r * 2, c.r * 2);
  });
}

// Handle clicks
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
      score++;
      document.getElementById("score").innerText = score;
      if (token) {
        await logDestroy(c.id, c.reward);
        fetchBalances();
      }
      spawnCircle();
      break;
    }
  }
});

// API calls
async function logSpawn(objectId) {
  if (!token) return;
  await fetch(`${API_BASE}/game/spawn`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": token },
    body: JSON.stringify({ objectId })
  });
}

async function logDestroy(objectId, reward) {
  if (!token) return;
  await fetch(`${API_BASE}/game/destroy`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": token },
    body: JSON.stringify({ objectId, reward })
  });
}

// Loops
setInterval(spawnCircle, 1000);
setInterval(drawCircles, 50);
