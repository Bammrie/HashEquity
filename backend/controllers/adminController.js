const User = require("../models/User");
const { ADMIN_WALLETS } = require("../config/admin");

const toNumber = (value) => {
  if (typeof value === "number") {
    return value;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatTokenAmount = (value) =>
  toNumber(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });

const serializeUser = (user) => ({
  walletAddress: user.walletAddress,
  hashBalance: toNumber(user.hashBalance),
  unmintedHash: toNumber(user.unmintedHash),
  isAdmin: Boolean(user.isAdmin),
  updatedAt: user.updatedAt,
  createdAt: user.createdAt,
});

const loadOverview = async () => {
  const [totals] = await User.aggregate([
    {
      $group: {
        _id: null,
        hashBalanceTotal: { $sum: "$hashBalance" },
        unmintedHashTotal: { $sum: "$unmintedHash" },
      },
    },
  ]);

  const totalPlayers = await User.countDocuments();

  const topUsers = await User.find()
    .sort({ unmintedHash: -1, hashBalance: -1 })
    .limit(10)
    .lean();

  return {
    summary: {
      totalPlayers,
      hashBalanceTotal: toNumber(totals?.hashBalanceTotal),
      unmintedHashTotal: toNumber(totals?.unmintedHashTotal),
      adminWallets: ADMIN_WALLETS,
      generatedAt: new Date().toISOString(),
    },
    topUsers: topUsers.map(serializeUser),
  };
};

exports.getOverview = async (_req, res) => {
  try {
    const overview = await loadOverview();

    res.json(overview);
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({ error: "Unable to load admin overview" });
  }
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

exports.renderOverviewPage = async (_req, res) => {
  try {
    const overview = await loadOverview();

    const { summary, topUsers } = overview;
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>HashEquity Admin Overview</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; padding: 24px; background: #0a061a; color: #f4f1ff; }
      h1 { margin-top: 0; }
      .summary { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 32px; }
      .card { background: rgba(37, 28, 69, 0.85); padding: 16px 20px; border-radius: 12px; box-shadow: 0 12px 24px rgba(5, 2, 18, 0.45); }
      .label { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(244, 241, 255, 0.64); margin-bottom: 6px; }
      table { width: 100%; border-collapse: collapse; background: rgba(37, 28, 69, 0.85); border-radius: 12px; overflow: hidden; box-shadow: 0 12px 24px rgba(5, 2, 18, 0.45); }
      th, td { padding: 12px 16px; text-align: left; }
      th { background: rgba(93, 66, 188, 0.55); font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.06em; }
      tr:nth-child(even) td { background: rgba(19, 13, 36, 0.55); }
      code { background: rgba(19, 13, 36, 0.85); padding: 2px 6px; border-radius: 6px; }
      footer { margin-top: 32px; font-size: 0.8rem; color: rgba(244, 241, 255, 0.64); }
    </style>
  </head>
  <body>
    <h1>HashEquity Admin Overview</h1>
    <p>Direct link for reviewing aggregate balances without connecting a wallet.</p>
    <section class="summary">
      <div class="card">
        <div class="label">Total Players</div>
        <div class="value">${summary.totalPlayers.toLocaleString("en-US")}</div>
      </div>
      <div class="card">
        <div class="label">HASH Balance (Total)</div>
        <div class="value">${formatTokenAmount(summary.hashBalanceTotal)}</div>
      </div>
      <div class="card">
        <div class="label">Unminted HASH (Total)</div>
        <div class="value">${formatTokenAmount(summary.unmintedHashTotal)}</div>
      </div>
      <div class="card">
        <div class="label">Admin Wallets</div>
        <div class="value">${summary.adminWallets.map((wallet) => `<code>${escapeHtml(wallet)}</code>`).join(" ") || "—"}</div>
      </div>
    </section>
    <section>
      <h2>Top Balances</h2>
      <table>
        <thead>
          <tr>
            <th>Wallet</th>
            <th>HASH</th>
            <th>Unminted HASH</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          ${topUsers
            .map(
              (user) => `<tr>
                <td><code>${escapeHtml(user.walletAddress)}</code></td>
                <td>${formatTokenAmount(user.hashBalance)}</td>
                <td>${formatTokenAmount(user.unmintedHash)}</td>
                <td>${user.isAdmin ? "Admin" : "Player"}</td>
              </tr>`
            )
            .join("") || `<tr><td colspan="4">No player data available yet.</td></tr>`}
        </tbody>
      </table>
    </section>
    <footer>Generated at ${escapeHtml(new Date(summary.generatedAt).toLocaleString("en-US"))}</footer>
  </body>
</html>`;

    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (error) {
    console.error("Admin overview page error:", error);
    res.status(500).send("Unable to render admin overview");
  }
};

