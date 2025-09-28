const API_BASE_URL =
  window.location.hostname === "hashequity.com"
    ? "https://hash-backend-production.up.railway.app/api"
    : "http://localhost:8080/api";

export default API_BASE_URL;
