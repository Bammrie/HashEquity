import API_BASE_URL from "./config.js";

let score = 0;
let token = localStorage.getItem("token");

// Signup
async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  alert(data.message);
}

// Login
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    token = data.token;
    document.getElementById("auth").style.display = "none";
    alert("Logged in!");
  } else {
    alert(data.message);
  }
}

// Report destroy
async function reportDestroy(points) {
  if (!token) return;
  await fetch(`${API_BASE_URL}/destroy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ score: points })
  });
}

// Export to global scope
window.signup = signup;
window.login = login;
window.reportDestroy = reportDestroy;
