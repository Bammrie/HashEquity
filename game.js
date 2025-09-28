const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 400;
document.body.appendChild(canvas);

let score = 0;
const scoreDisplay = document.createElement("div");
scoreDisplay.style.color = "white";
scoreDisplay.style.fontSize = "20px";
scoreDisplay.textContent = "Score: 0";
document.body.appendChild(scoreDisplay);

let objects = [];

// create objects
for (let i = 0; i < 15; i++) {
  objects.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: 15,
    color: "lime"
  });
}

function drawObjects() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const obj of objects) {
    ctx.beginPath();
    ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
    ctx.fillStyle = obj.color;
    ctx.fill();
    ctx.closePath();
  }
}

// send destroy event to backend
async function registerDestroy(objectId) {
  try {
    await fetch("https://hash-backend-production-a979.up.railway.app/destroy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "guest", // replace later with logged-in user
        objectId: objectId
      })
    });
  } catch (err) {
    console.error("Failed to register destroy:", err);
  }
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  objects = objects.filter((obj) => {
    const dx = mouseX - obj.x;
    const dy = mouseY - obj.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < obj.radius) {
      score++;
      scoreDisplay.textContent = "Score: " + score;
      registerDestroy(Date.now().toString()); // log to backend
      return false;
    }
    return true;
  });

  drawObjects();
});

drawObjects();
