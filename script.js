const API_BASE = "https://hash-backend-production.up.railway.app/api";

let score = 0;
let token = localStorage.getItem("token");
let userEmail = localStorage.getItem("email");

// Elements
const authForm = document.getElementById("authForm");
const profileBox = document.getElementById("profileBox");
const welcomeText = document.getElementById("welcomeText");
const unmintedHashEl = document.getElementById("unmintedHash");
const hashBalanceEl = document.getElementById("hashBalance");
const scoreEl = document.getElementById("score");
const countdownEl = document.getElementById("countdown");

// Show correct UI state
function updateUI() {
  if (token && userEmail) {
    authForm.style.display = "none";
    profileBox.style.display = "block";
    welcomeText.textContent = `Welcome, ${userEmail}`;
    fetchBalances();
  } else {
    authForm.style.display = "block";
    profileBox.style.display = "none";
  }
}

// Signup
async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (data.token) {
    token = data.token;
    userEmail = email;
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    updateUI();
  } else {
    alert(data.message || "Signup failed");
  }
}

// Login
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (data.token) {
    token = data.token;
    userEmail = email;
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    updateUI();
  } else {
    alert(data.message || "Login failed");
  }
}

// Logout
function logout() {
  token = null;
  userEmail = null;
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  updateUI();
}

// Fetch balances
async function fetchBalances() {
  if (!token) return;
  const res = await fetch(`${API_BASE}/user/balances`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (data.unmintedHash !== undefined) {
    unmintedHashEl.textContent = data.unmintedHash;
    hashBalanceEl.textContent = data.hashBalance;
  }
}

// Game Setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let circles = [];

function spawnCircle() {
  const x = Math.random() * (canvas.width - 20) + 10;
  const y = Math.random() * (canvas.height - 20) + 10;
  circles.push({ x, y, r: 10 });
}

function drawCircles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "lime";
  circles.forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  circles = circles.filter(c => {
    const dist = Math.hypot(c.x - x, c.y - y);
    if (dist < c.r) {
      score++;
      scoreEl.textContent = `Score: ${score}`;
      if (token) {
        fetch(`${API_BASE}/game/destroy`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ points: 1 })
        }).then(fetchBalances);
      }
      return false;
    }
    return true;
  });
});

setInterval(spawnCircle, 1000);
setInterval(drawCircles, 50);

// Daily mint countdown
function updateCountdown() {
  const now = new Date();
  const nextMint = new Date();
  nextMint.setUTCHours(24, 0, 0, 0);
  const diff = nextMint - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  countdownEl.textContent = `Next Mint in ${hours}h ${minutes}m ${seconds}s`;
}
setInterval(updateCountdown, 1000);

// Init UI
updateUI();
updateCountdown();
