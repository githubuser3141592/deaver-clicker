// =========================
// CORE GAME STATE
// =========================
let pendingClicks = 0;
let hasSeenUpgrades = false;

const game = {
  gp: 0,
  gps: 0,
  gpPerClick: 1,
  totalClicks: 0,
  globalMultiplier: 1,
  achievementBoost: 1,
  idleBoost: 1
};

// DOM refs
const gpSpan = document.getElementById("gp");
const gpsSpan = document.getElementById("gps");
const buildingsList = document.getElementById("buildings-list");
const deaverButton = document.getElementById("deaver-button");

const openUpgradesBtn = document.getElementById("open-upgrades");
const upgradeOverlay = document.getElementById("upgrade-overlay");
const upgradeList = document.getElementById("upgrade-list");

// TEMP wipe button
const wipeBtn = document.getElementById("wipe-save-btn");
if (wipeBtn) {
  wipeBtn.addEventListener("click", () => {
    localStorage.removeItem("deaverSave");
    location.reload();
  });
}

// =========================
// UPGRADE OVERLAY
// =========================
openUpgradesBtn.addEventListener("click", () => {
  refreshUpgradeList();
  upgradeOverlay.style.display = "block";
  setTimeout(() => upgradeOverlay.classList.add("show"), 10);

  hasSeenUpgrades = true;
  document.getElementById("upgrade-dot").style.display = "none";
});

upgradeOverlay.addEventListener("click", (e) => {
  if (e.target === upgradeOverlay) {
    upgradeOverlay.classList.remove("show");
    setTimeout(() => upgradeOverlay.style.display = "none", 250);
  }
});

// =========================
// ACHIEVEMENT POPUPS
// =========================
function showAchievementPopup(a) {
  const container = document.getElementById("achievement-popup-container");

  const div = document.createElement("div");
  div.className = "achievement-popup";
  div.innerHTML = `
    <strong>${a.name}</strong><br>
    <span>${a.description}</span>
  `;

  div.addEventListener("click", () => div.remove());
  container.appendChild(div);

  setTimeout(() => div.classList.add("show"), 10);

  setTimeout(() => {
    div.classList.remove("show");
    setTimeout(() => div.remove(), 250);
  }, 6000);
}

// =========================
// UPGRADE LIST
// =========================
function refreshUpgradeList() {
  upgradeList.innerHTML = "";

  upgrades.forEach(u => {
    if (u.purchased) return;

    if (u.requiresBuilding) {
      const b = buildings.find(x => x.id === u.requiresBuilding);
      // Special unlock condition for the stock market
      if (u.id === "marketAccess") {
        const fresh = buildings.find(b => b.id === "freshman").amount;
        const leaders = buildings.find(b => b.id === "sectionLeader").amount;
        if (fresh < 25 || leaders < 5) return;
      }

      if (!b || b.amount < 1) return;
    }

    const div = document.createElement("div");
    div.className = "upgrade-entry";

    if (game.gp < u.cost) div.classList.add("locked");

    div.innerHTML = `
      <strong>${u.name}</strong><br>
      <p>${u.description}</p>
      <p>Cost: ${u.cost} GP</p>
    `;

    div.addEventListener("click", () => {
      if (game.gp >= u.cost) {
        buyUpgrade(u);
        refreshUpgradeList();
      }
    });

    upgradeList.appendChild(div);
  });
}

// =========================
// CLICK HANDLER
// =========================
deaverButton.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  pendingClicks++;
  game.totalClicks++;

  deaverButton.classList.remove("bounce");
  void deaverButton.offsetWidth;
  deaverButton.classList.add("bounce");
});

// =========================
// BUILDING UI
// =========================
function createBuildingUI(building) {
  const div = document.createElement("div");
  div.className = "building";

  const title = document.createElement("div");
  title.className = "building-title";
  title.textContent = building.name;

  const desc = document.createElement("div");
  desc.className = "building-desc";
  desc.textContent = building.description;

  const prod = document.createElement("div");
  prod.className = "building-prod";
  prod.textContent = `+${building.baseProduction} GP/s each`;

  const btn = document.createElement("button");
  btn.className = "building-buy";
  btn.textContent = `Buy — ${building.baseCost} GP`;
  btn.addEventListener("click", () => buyBuilding(building.id));

  const amt = document.createElement("div");
  amt.className = "building-owned";
  amt.textContent = `Owned: ${building.amount}`;

  div.appendChild(title);
  div.appendChild(desc);
  div.appendChild(prod);
  div.appendChild(btn);
  div.appendChild(amt);

  building.ui = { btn, amt, prod };
  buildingsList.appendChild(div);
}

function initBuildings() {
  buildingsList.innerHTML = "";
  buildings.forEach(b => createBuildingUI(b));
}

// =========================
// BUY BUILDING
// =========================
function getBuildingCost(b) {
  let discount = b.discount || 0;
  return Math.floor(
    b.baseCost *
    Math.pow(b.costMultiplier, b.amount) *
    (1 - discount)
  );
}

function buyBuilding(id) {
  const b = buildings.find(x => x.id === id);
  const cost = getBuildingCost(b);

  if (game.gp >= cost) {
    game.gp -= cost;
    b.amount++;
    updateGPS();
    updateBuildingUI(b);
    gpSpan.textContent = Math.floor(game.gp);
  }
  updateUpgradeDot();
}

function updateBuildingUI(b) {
  b.ui.btn.textContent = `Buy — ${getBuildingCost(b)} GP`;
  b.ui.amt.textContent = `Owned: ${b.amount}`;
  b.ui.prod.textContent = `+${b.baseProduction} GP/s each`;
}

// =========================
// UPGRADE EFFECTS
// =========================
function applyUpgradeEffects() {
  upgrades.forEach(u => {
    if (u.purchased && u.effect) {
      u.effect();
    }
  });
}

// =========================
// GPS CALCULATION
// =========================
function updateGPS() {
  let total = 0;

  buildings.forEach(b => {
    let prod = b.baseProduction;

    // synergy bonuses
    if (b.synergyBonus) {
      prod *= (1 + b.synergyBonus);
    }

    // building-specific multipliers
    upgrades.forEach(u => {
      if (u.purchased && u.requiresBuilding === b.id && u.multiplier) {
        prod *= u.multiplier;
      }
    });

    total += b.amount * prod;
  });

  // global multipliers
  total *= (game.globalMultiplier || 1);
  total *= (game.achievementBoost || 1);
  total *= (game.idleBoost || 1);

  game.gps = total;
  gpsSpan.textContent = total.toFixed(1);
}

// =========================
// UPGRADE BUYING
// =========================
function buyUpgrade(u) {
  game.gp -= u.cost;
  u.purchased = true;
  if (u.id === "marketAccess") {
    openMarketBtn.style.display = "block";
  }

  applyUpgradeEffects();
  updateGPS();
  updateUpgradeDot();
}

function updateUpgradeDot() {
  const dot = document.getElementById("upgrade-dot");

  let upgradeAvailable = false;

  upgrades.forEach(u => {
    if (u.purchased) return;

    if (u.requiresBuilding) {
      const b = buildings.find(x => x.id === u.requiresBuilding);
      if (!b || b.amount < 1) return;
    }

    upgradeAvailable = true;
  });

  if (upgradeAvailable && !hasSeenUpgrades) {
    dot.style.display = "block";
  } else {
    dot.style.display = "none";
  }
}

// =========================
// ACHIEVEMENTS
// =========================
function checkAchievements() {
  achievements.forEach(a => {
    if (!a.unlocked && a.condition()) {
      a.unlocked = true;
      showAchievementPopup(a);
    }
  });
}

//==========================
// STOCK MARKET MINIGAME
//==========================
// =========================
// STOCK MARKET MINIGAME
// =========================

game.marketUnlocked = false;
game.marketPrice = 100;
game.marketShares = 0;

// UI refs
const marketOverlay = document.getElementById("market-overlay");
const marketPanel = document.getElementById("market-sidebar");
const marketPriceEl = document.getElementById("market-price");
const marketOwnedEl = document.getElementById("market-owned");
const openMarketBtn = document.getElementById("open-market");

document.getElementById("close-market").addEventListener("click", () => {
  marketOverlay.classList.remove("show");
});

openMarketBtn.addEventListener("click", () => {
  marketOverlay.classList.add("show");
});

// Fake stock price movement (unique per player)
setInterval(() => {
  if (!game.marketUnlocked) return;

  let volatility = 5; // normal movement

  // 10% chance of a volatility spike
  if (Math.random() < 0.10) {
    volatility = 40; // big swing
  }

  // random walk
  const change = Math.floor((Math.random() - 0.5) * volatility);
  game.marketPrice = Math.max(1, game.marketPrice + change);

  marketPriceEl.textContent = `Price: ${game.marketPrice} GP`;
}, 30000); // 30 seconds


// Buy
document.getElementById("market-buy").addEventListener("click", () => {
  if (game.gp >= game.marketPrice) {
    game.gp -= game.marketPrice;
    game.marketShares++;
    marketOwnedEl.textContent = `Shares Owned: ${game.marketShares}`;
    gpSpan.textContent = Math.floor(game.gp);
  }
});

// Sell
document.getElementById("market-sell").addEventListener("click", () => {
  if (game.marketShares > 0) {
    game.marketShares--;
    game.gp += game.marketPrice;
    marketOwnedEl.textContent = `Shares Owned: ${game.marketShares}`;
    gpSpan.textContent = Math.floor(game.gp);
  }
});


// =========================
// GAME LOOP (10 TPS)
// =========================
setInterval(() => {
  applyUpgradeEffects();

  let changed = false;

  if (game.gps > 0) {
    game.gp += game.gps / 10;
    changed = true;
  }

  checkAchievements();
  updateUpgradeDot();

  if (changed) {
    gpSpan.textContent = Math.floor(game.gp);
  }

  if (pendingClicks > 0) {
    game.gp += pendingClicks * game.gpPerClick;
    pendingClicks = 0;
    gpSpan.textContent = Math.floor(game.gp);
  }
}, 100);

// =========================
// INIT
// =========================
loadGame();
initBuildings();
applyUpgradeEffects();
updateGPS();
gpSpan.textContent = Math.floor(game.gp);
updateUpgradeDot();

setInterval(saveGame, 5000);