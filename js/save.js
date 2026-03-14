function saveGame() {
  const saveData = {
    game,
    buildings: buildings.map(b => ({
      ...b,
      ui: undefined // don't save UI elements
    })),
    upgrades: upgrades.map(u => ({
      ...u,
      ui: undefined
    })),
    achievements: achievements.map(a => ({
      ...a
    }))
  };

  localStorage.setItem("deaverSave", JSON.stringify(saveData));
}

function loadGame() {
  const raw = localStorage.getItem("deaverSave");
  if (!raw) return;

  const data = JSON.parse(raw);

  Object.assign(game, data.game);

  data.buildings.forEach((saved, i) => {
    Object.assign(buildings[i], saved);
  });

  data.upgrades.forEach((saved, i) => {
    Object.assign(upgrades[i], saved);
  });

  data.achievements.forEach((saved, i) => {
    Object.assign(achievements[i], saved);
  });

  // ❌ REMOVE THESE LINES IF THEY STILL EXIST:
  // buildingsList.innerHTML = "";
  // initBuildings();
  // upgradesBar.innerHTML = "";
  // initUpgrades();

  // UI is rebuilt ONLY in main.js
}