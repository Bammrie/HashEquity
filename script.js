const backendUrl = "https://hash-backend-production.up.railway.app";
let token = null;
let score = 0;

async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${backendUrl}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (res.ok) {
    alert("Signup successful! Now log in.");
  } else {
    alert(data.error || "Signup failed");
  }
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${backendUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (res.ok) {
    token = data.token;
    document.getElementById("status").textContent = "Logged in as " + data.email;
  } else {
    alert(data.error || "Login failed");
  }
}

// ----------------- GAME -----------------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let objects = [];

function spawnObject() {
  const x = Math.random() * (canvas.width - 20);
  const y = Math.random() * (canvas.height - 20);
  objects.push({ x, y, r: 10 });
}

function drawObjects() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "lime";
  objects.forEach(o => {
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

canvas.addEventListener("click", async (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let i = 0; i < objects.length; i++) {
    const o = objects[i];
    const dx = x - o.x;
    const dy = y - o.y;
    if (dx * dx + dy * dy <= o.r * o.r) {
      objects.splice(i, 1);
      score++;
      document.getElementById("score").textContent = score;

      if (token) {
        await fetch(`${backendUrl}/destroy`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ objectId: Date.now().toString() })
        });
      }
      break;
    }
  }
});

setInterval(spawnObject, 1000);
setInterval(drawObjects, 50);
