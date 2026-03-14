// Buildings
const buildings = [
  {
    id: "freshman",
    name: "Freshman",
    baseCost: 15,
    costMultiplier: 1.15,
    baseProduction: 0.1,
    description: "They try their best.",
    amount: 0
  },
  {
    id: "sectionLeader",
    name: "Section Leader",
    baseCost: 100,
    costMultiplier: 1.15,
    baseProduction: 1,
    description: "Keeps the freshmen in line.",
    amount: 0
  }
];

// Upgrades
const upgrades = [
  {
    id: "freshmanTraining",
    name: "Freshman Training",
    cost: 100,
    requiresBuilding: "freshman",   // FIXED
    multiplier: 2,
    purchased: false,               // REQUIRED
    description: "Freshmen become slightly less confused. x2 GpS from freshmen"
  }
];

// Achievements
const achievements = [
  {
    id: "firstClick",
    name: "First Click!",
    condition: () => game.totalClicks >= 1,
    reward: 0.1,
    description: "You clicked the Deaver.",
    unlocked: false                 // also needed
  }
];