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
  if (!raw) {
    // Reset everything to defaults when no save exists
    game.gp = 0;
    game.gps = 0;
    game.gpPerClick = 1;
    game.totalClicks = 0;

    buildings.forEach(b => {
      b.amount = 0;
    });

    upgrades.forEach(u => {
      u.purchased = false;
    });

    achievements.forEach(a => {
      a.unlocked = false;
    });

    return;
  }

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
}