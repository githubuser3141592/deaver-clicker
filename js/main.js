// =========================
// CORE GAME STATE
// =========================
let pendingClicks = 0;
let hasSeenUpgrades = false;
const game = {
  gp: 0,
  gps: 0,
  gpPerClick: 1,
  totalClicks: 0
};

// DOM refs
const gpSpan = document.getElementById("gp");
const gpsSpan = document.getElementById("gps");
const buildingsList = document.getElementById("buildings-list");
const deaverButton = document.getElementById("deaver-button");

const openUpgradesBtn = document.getElementById("open-upgrades");
const upgradeOverlay = document.getElementById("upgrade-overlay");
const upgradeList = document.getElementById("upgrade-list");

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

function showAchievementPopup(a) {
  const container = document.getElementById("achievement-popup-container");

  const div = document.createElement("div");
  div.className = "achievement-popup";
  div.innerHTML = `
    <strong>${a.name}</strong><br>
    <span>${a.description}</span>
  `;

  // clicking removes it
  div.addEventListener("click", () => {
    div.remove();
  });

  container.appendChild(div);

  // animate in
  setTimeout(() => div.classList.add("show"), 10);

  // auto-remove after 6 seconds if not clicked
  setTimeout(() => {
    div.classList.remove("show");
    setTimeout(() => div.remove(), 250);
  }, 6000);
}

function refreshUpgradeList() {
  upgradeList.innerHTML = "";

  upgrades.forEach(u => {
    if (u.purchased) return;

    const b = buildings.find(x => x.id === u.requiresBuilding);
    if (!b || b.amount < 1) return; // hide if not enough buildings

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
// BUILDING UI GENERATION
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
  buildings.forEach(b => createBuildingUI(b));
}

// =========================
// BUY BUILDING
// =========================

function getBuildingCost(b) {
  return Math.floor(b.baseCost * Math.pow(b.costMultiplier, b.amount));
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
// GPS CALCULATION
// =========================

function updateGPS() {
  let total = 0;

  buildings.forEach(b => {
    let prod = b.baseProduction;

    // apply upgrades that affect this building
    upgrades.forEach(u => {
      if (u.purchased && u.requiresBuilding === b.id) {
        prod *= u.multiplier;
      }
    });

    total += b.amount * prod;
  });

  game.gps = total;
  gpsSpan.textContent = total.toFixed(1);
}

// =========================
// UPGRADE UI
// =========================
function canBuyUpgrade(u) {
  const b = buildings.find(x => x.id === u.requiresBuilding);
  return (
    !u.purchased &&
    b.amount >= 1 &&
    game.gp >= u.cost
  );
}

function buyUpgrade(u) {
  game.gp -= u.cost;
  u.purchased = true;
  updateGPS();
  updateUpgradeDot();
}

function updateUpgradeDot() {
  const dot = document.getElementById("upgrade-dot");

  let upgradeAvailable = false;

  upgrades.forEach(u => {
    if (u.purchased) return;

    const b = buildings.find(x => x.id === u.requiresBuilding);
    if (!b || b.amount < 1) return;

    upgradeAvailable = true;
  });

  // If a new upgrade becomes available AND the player hasn't seen it yet
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

// =========================
// GAME LOOP (10 TPS)
// =========================

setInterval(() => {
  let changed = false;

  if (game.gps > 0) {
    game.gp += game.gps / 10;
    changed = true;
  }

  checkAchievements();
  updateUpgradeDot();

  if (changed) {
    // only update if passive income changed GP
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
updateGPS();
gpSpan.textContent = Math.floor(game.gp);
updateUpgradeDot();

setInterval(saveGame, 5000);