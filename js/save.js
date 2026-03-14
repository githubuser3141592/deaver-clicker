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

  // restore game
  Object.assign(game, data.game);

  // restore buildings
  data.buildings.forEach((saved, i) => {
    Object.assign(buildings[i], saved);
  });

  // restore upgrades
  data.upgrades.forEach((saved, i) => {
    Object.assign(upgrades[i], saved);
  });

  // restore achievements
  data.achievements.forEach((saved, i) => {
    Object.assign(achievements[i], saved);
  });

  // rebuild UI
  buildingsList.innerHTML = "";
  initBuildings();

  // upgrades are now shown ONLY in the slide-out panel
  // so we do NOT rebuild icons anymore

  updateGPS();
  gpSpan.textContent = Math.floor(game.gp);
  updateUpgradeDot();
}