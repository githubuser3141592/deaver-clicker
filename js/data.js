// =========================
// BUILDINGS
// =========================
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
  },
  {
    id: "upperclassman",
    name: "Upperclassman",
    baseCost: 500,
    costMultiplier: 1.15,
    baseProduction: 8,
    description: "Knows where rehearsal letters are.",
    amount: 0
  },
  {
    id: "bandCaptain",
    name: "Band Captain",
    baseCost: 3000,
    costMultiplier: 1.15,
    baseProduction: 40,
    description: "Runs sectionals like a tiny dictator.",
    amount: 0
  },
  {
    id: "drumMajor",
    name: "Drum Major",
    baseCost: 10000,
    costMultiplier: 1.15,
    baseProduction: 100,
    description: "Conducts with dramatic flair.",
    amount: 0
  },
  {
    id: "assistantDirector",
    name: "Assistant Director",
    baseCost: 40000,
    costMultiplier: 1.15,
    baseProduction: 400,
    description: "Repeats instructions louder.",
    amount: 0
  },
  {
    id: "bandDirector",
    name: "Band Director",
    baseCost: 150000,
    costMultiplier: 1.15,
    baseProduction: 1500,
    description: "The ultimate authority of rehearsal.",
    amount: 0
  },
  {
    id: "marchingBand",
    name: "Entire Marching Band",
    baseCost: 1000000,
    costMultiplier: 1.15,
    baseProduction: 10000,
    description: "A full ensemble generating maximum band energy.",
    amount: 0
  }
];


// =========================
// UPGRADES
// =========================
const upgrades = [

  // Basic multiplier upgrade
  {
    id: "freshmanTraining",
    name: "Freshman Training",
    cost: 100,
    requiresBuilding: "freshman",
    multiplier: 2,
    purchased: false,
    description: "Freshmen become slightly less confused. x2 GpS from freshmen"
  },

  // SYNERGY — Freshmen boost Section Leaders
  {
    id: "leadershipPipeline",
    name: "Leadership Pipeline",
    cost: 2000,
    requiresBuilding: "freshman",
    purchased: false,
    type: "synergy",
    description: "Every 10 freshmen increases Section Leader production by 5%",
    effect: () => {
      const freshmen = buildings.find(b => b.id === "freshman").amount;
      const leaders = buildings.find(b => b.id === "sectionLeader");
      leaders.synergyBonus = Math.floor(freshmen / 10) * 0.05;
    }
  },

  // COST REDUCTION — Freshmen get cheaper
  {
    id: "instrumentRentalProgram",
    name: "Instrument Rental Program",
    cost: 3000,
    requiresBuilding: "freshman",
    purchased: false,
    type: "costReduction",
    description: "Freshmen cost 5% less for every 20 owned",
    effect: () => {
      const freshmen = buildings.find(b => b.id === "freshman").amount;
      buildings.find(b => b.id === "freshman").discount =
        Math.floor(freshmen / 20) * 0.05;
    }
  },

  // CLICK POWER — Drum Majors increase click value
  {
    id: "crowdHype",
    name: "Crowd Hype",
    cost: 5000,
    purchased: false,
    type: "clickPower",
    description: "Clicks gain +1 GP for every Drum Major",
    effect: () => {
      const drumMajors = buildings.find(b => b.id === "drumMajor").amount;
      game.gpPerClick = 1 + drumMajors;
    }
  },

  // GLOBAL MULTIPLIER — All buildings equal = big buff
  {
    id: "perfectBalance",
    name: "Perfect Band Balance",
    cost: 20000,
    purchased: false,
    type: "global",
    description: "If all sections have the same number of members, +50% GpS",
    effect: () => {
      const amounts = buildings.map(b => b.amount);
      const allEqual = amounts.every(a => a === amounts[0]);
      game.globalMultiplier = allEqual ? 1.5 : 1;
    }
  },

  // SYNERGY — Upperclassmen boost Freshmen
  {
    id: "mentorshipProgram",
    name: "Mentorship Program",
    cost: 12000,
    requiresBuilding: "upperclassman",
    purchased: false,
    type: "synergy",
    description: "Upperclassmen boost Freshmen production by 5% each",
    effect: () => {
      const upper = buildings.find(b => b.id === "upperclassman").amount;
      const fresh = buildings.find(b => b.id === "freshman");
      fresh.synergyBonus = upper * 0.05;
    }
  },

  // ACHIEVEMENT BOOST — Achievements increase GpS
  {
    id: "trophyCase",
    name: "Trophy Case",
    cost: 8000,
    purchased: false,
    type: "achievementBoost",
    description: "Each achievement increases GpS by 2%",
    effect: () => {
      const unlocked = achievements.filter(a => a.unlocked).length;
      game.achievementBoost = 1 + unlocked * 0.02;
    }
  }
];


// =========================
// ACHIEVEMENTS
// =========================
const achievements = [
  {
    id: "firstClick",
    name: "First Click!",
    condition: () => game.totalClicks >= 1,
    reward: 0.1,
    description: "You clicked the Deaver.",
    unlocked: false
  },
  {
    id: "tenClicks",
    name: "Warming Up",
    condition: () => game.totalClicks >= 10,
    reward: 0.05,
    description: "Click the Deaver 10 times.",
    unlocked: false
    },
    {
    id: "hundredClicks",
    name: "Now We're Practicing",
    condition: () => game.totalClicks >= 100,
    reward: 0.1,
    description: "Click the Deaver 100 times.",
    unlocked: false
    },
    {
    id: "thousandClicks",
    name: "Rehearsal Marathon",
    condition: () => game.totalClicks >= 1000,
    reward: 0.2,
    description: "Click the Deaver 1,000 times.",
    unlocked: false
    },
    {
    id: "tenThousandClicks",
    name: "Carpal Tunnel Speedrun",
    condition: () => game.totalClicks >= 10000,
    reward: 0.5,
    description: "Click the Deaver 10,000 times.",
    unlocked: false
  },
  {
    id: "firstFreshman",
    name: "Recruitment Day",
    condition: () => buildings.find(b => b.id === "freshman").amount >= 1,
    reward: 0.05,
    description: "Recruit your first freshman.",
    unlocked: false
    },
    {
    id: "tenFreshmen",
    name: "Baby Band",
    condition: () => buildings.find(b => b.id === "freshman").amount >= 10,
    reward: 0.1,
    description: "Have 10 freshmen.",
    unlocked: false
    },
    {
    id: "fiftyFreshmen",
    name: "Freshman Army",
    condition: () => buildings.find(b => b.id === "freshman").amount >= 50,
    reward: 0.2,
    description: "Have 50 freshmen.",
    unlocked: false
  },
  {
    id: "hundredGps",
    name: "Band Is Cooking",
    condition: () => game.gps >= 100,
    reward: 0.1,
    description: "Reach 100 GpS.",
    unlocked: false
    },
    {
    id: "thousandGps",
    name: "State Level Sound",
    condition: () => game.gps >= 1000,
    reward: 0.2,
    description: "Reach 1,000 GpS.",
    unlocked: false
    },
    {
    id: "millionGps",
    name: "National Champions",
    condition: () => game.gps >= 1000000,
    reward: 0.5,
    description: "Reach 1,000,000 GpS.",
    unlocked: false
    },
    {
    id: "firstUpgrade",
    name: "Improvement!",
    condition: () => upgrades.some(u => u.purchased),
    reward: 0.1,
    description: "Buy your first upgrade.",
    unlocked: false
    },
    {
    id: "fiveUpgrades",
    name: "Band Is Improving",
    condition: () => upgrades.filter(u => u.purchased).length >= 5,
    reward: 0.2,
    description: "Buy 5 upgrades.",
    unlocked: false
    },
    {
    id: "overachiever",
    name: "Overachiever",
    condition: () => game.totalClicks >= 1337,
    reward: 0.2,
    description: "Click exactly 1337 times.",
    unlocked: false
    },
    {
    id: "bandKidEnergy",
    name: "Band Kid Energy",
    condition: () =>
        buildings.reduce((sum, b) => sum + b.amount, 0) >= 100,
    reward: 0.3,
    description: "Have 100 total band members.",
    unlocked: false
    },
    {
    id: "absoluteChaos",
    name: "Absolute Chaos",
    condition: () => game.gps >= 10000000,
    reward: 1,
    description: "Your band has become unstoppable.",
    unlocked: false
    },
    {
    id: "oneMoreTime",
    name: "One More Time...",
    condition: () => game.totalClicks >= 5000,
    reward: 0.25,
    description: "Never actually one more time",
    unlocked: false
    }
];