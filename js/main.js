// Core game state
const game = {
  gp: 0,          // grump points
  gps: 0,         // grump points per second (from buildings later)
  gpPerClick: 1,  // base click value
};

// DOM refs
const gpSpan = document.getElementById("gp");
const gpsSpan = document.getElementById("gps");
const deaverButton = document.getElementById("deaver-button");

// Click handler
deaverButton.addEventListener("click", () => {
  game.gp += game.gpPerClick;
  updateDisplay();
  // later: floating +1 text, jiggle, sound, etc.
});

// Display update
function updateDisplay() {
  gpSpan.textContent = Math.floor(game.gp);
  gpsSpan.textContent = game.gps.toFixed(1);
}

// Basic game loop (for passive income later)
const TICK_MS = 100; // 10 ticks per second

setInterval(() => {
  if (game.gps > 0) {
    game.gp += (game.gps / 10); // gps spread over 10 ticks
    updateDisplay();
  }
}, TICK_MS);

// Initial draw
updateDisplay();