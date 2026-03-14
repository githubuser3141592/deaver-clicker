// =========================
// CORE GAME STATE
// =========================

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
const upgradesBar = document.getElementById("upgrades-bar");
const upgradesExpanded = document.getElementById("upgrades-expanded");

// =========================
// CLICK HANDLER
// =========================

deaverButton.addEventListener("click", () => {
  game.gp += game.gpPerClick;
  game.totalClicks++;
  gpSpan.textContent = Math.floor(game.gp);
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

function createUpgradeIcon(upgrade) {
  const icon = document.createElement("div");
  icon.className = "upgrade-icon locked";

  const tooltip = document.createElement("div");
  tooltip.className = "upgrade-tooltip";
  tooltip.innerHTML = `
    <strong>${upgrade.name}</strong><br>
    ${upgrade.description}<br>
    Cost: ${upgrade.cost} GP
  `;

  icon.appendChild(tooltip);

  icon.addEventListener("mouseenter", () => {
    tooltip.style.display = "block";
  });

  icon.addEventListener("mouseleave", () => {
    tooltip.style.display = "none";
  });

  icon.addEventListener("click", () => {
    if (canBuyUpgrade(upgrade)) {
      buyUpgrade(upgrade);
      icon.remove();
    }
  });

  upgrade.ui = { icon, tooltip };
  upgradesBar.appendChild(icon);
}

function initUpgrades() {
  upgrades.forEach(u => {
    if (u.purchased === undefined) u.purchased = false;
    createUpgradeIcon(u);
  });
}

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
}

// =========================
// ACHIEVEMENTS
// =========================

function checkAchievements() {
  achievements.forEach(a => {
    if (!a.unlocked && a.condition()) {
      a.unlocked = true;
      console.log("Achievement unlocked:", a.name);
    }
  });
}

// =========================
// GAME LOOP (10 TPS)
// =========================

setInterval(() => {
  // passive income
  if (game.gps > 0) {
    game.gp += game.gps / 10;
    gpSpan.textContent = Math.floor(game.gp);
  }

  // update upgrade icon brightness
  upgrades.forEach(u => {
    if (u.purchased) return;

    const b = buildings.find(x => x.id === u.requiresBuilding);

    if (b.amount >= 1 && game.gp >= u.cost) {
      u.ui.icon.classList.remove("locked");
    } else {
      u.ui.icon.classList.add("locked");
    }
  });

  checkAchievements();
}, 100);

// =========================
// INIT
// =========================

initBuildings();
initUpgrades();
updateGPS();
gpSpan.textContent = 0;