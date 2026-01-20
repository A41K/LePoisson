const FISH_TYPES = [
  // --- TIER 1: COMMON (Easy practice) ---
  { id: "anchovy", s: "🐟", n: "Anchovy", p: 10, c: 0.22, clicks: 4, speed: 2000, decay: 0.05, agility: 0.1, stars: 1 },
  { id: "minnow", s: "🐟", n: "Minnow", p: 15, c: 0.18, clicks: 6, speed: 1800, decay: 0.08, agility: 0.15, stars: 1 },
  { id: "shrimp", s: "🦐", n: "Shrimp", p: 25, c: 0.12, clicks: 5, speed: 1600, decay: 0.1, agility: 0.25, stars: 1 },
  { id: "crab", s: "🦀", n: "Crab", p: 45, c: 0.1, clicks: 8, speed: 2200, decay: 0.12, agility: 0.1, stars: 1 },

  // --- TIER 2: UNCOMMON (Start of challenge) ---
  { id: "clown", s: "🐠", n: "Clownfish", p: 80, c: 0.08, clicks: 12, speed: 1500, decay: 0.15, agility: 0.35, stars: 2 },
  { id: "carp", s: "🐟", n: "Carp", p: 110, c: 0.07, clicks: 15, speed: 1400, decay: 0.18, agility: 0.3, stars: 2 },
  { id: "jelly", s: "🎐", n: "Jellyfish", p: 160, c: 0.06, clicks: 18, speed: 1300, decay: 0.2, agility: 0.5, stars: 2 },
  { id: "lobster", s: "🦞", n: "Lobster", p: 200, c: 0.05, clicks: 14, speed: 1400, decay: 0.22, agility: 0.2, stars: 2 },

  // --- TIER 3: RARE (Needs Gear) ---
  { id: "puffer", s: "🐡", n: "Puffer", p: 400, c: 0.035, clicks: 25, speed: 1000, decay: 0.35, agility: 0.7, stars: 3 },
  { id: "squid", s: "🦑", n: "Squid", p: 550, c: 0.03, clicks: 30, speed: 900, decay: 0.4, agility: 0.8, stars: 3 },
  { id: "eel", s: "🔌", n: "Electric Eel", p: 750, c: 0.025, clicks: 35, speed: 700, decay: 0.5, agility: 1.0, stars: 3 },
  { id: "octopus", s: "🐙", n: "Octopus", p: 900, c: 0.02, clicks: 40, speed: 800, decay: 0.45, agility: 0.6, stars: 3 },

  // --- TIER 4: EPIC (High Speed) ---
  { id: "angler", s: "🏮", n: "Angler", p: 1500, c: 0.015, clicks: 45, speed: 600, decay: 0.6, agility: 1.2, stars: 4 },
  { id: "sword", s: "🗡️", n: "Swordfish", p: 2200, c: 0.012, clicks: 55, speed: 450, decay: 0.7, agility: 1.5, stars: 4 },
  { id: "manta", s: "🦇", n: "Manta Ray", p: 2800, c: 0.01, clicks: 50, speed: 500, decay: 0.65, agility: 1.1, stars: 4 },
  { id: "hammerhead", s: "🔨", n: "Hammerhead", p: 3500, c: 0.008, clicks: 65, speed: 400, decay: 0.8, agility: 1.4, stars: 4 },

  // --- TIER 5: LEGENDARY (The Ultimate Hunt) ---
  { id: "goldfish", s: "✨", n: "Gold Fish", p: 5000, c: 0.005, clicks: 30, speed: 1200, decay: 0.3, agility: 2.0, stars: 5 },
  { id: "whale", s: "🐳", n: "Ancient Whale", p: 8000, c: 0.004, clicks: 90, speed: 500, decay: 1.0, agility: 0.8, stars: 5 },
  { id: "axolotl", s: "🦎", n: "Axolotl", p: 12000, c: 0.003, clicks: 20, speed: 1500, decay: 0.1, agility: 3.0, stars: 5 },
  { id: "ghost_fish", s: "👻", n: "Ghost Fish", p: 15000, c: 0.002, clicks: 50, speed: 200, decay: 1.2, agility: 3.5, stars: 5 },
  { id: "kraken", s: "🦑", n: "Mini Kraken", p: 25000, c: 0.0015, clicks: 130, speed: 300, decay: 1.5, agility: 1.8, stars: 5 },
  { id: "dragon_carp", s: "🐲", n: "Dragon Carp", p: 50000, c: 0.001, clicks: 160, speed: 450, decay: 1.8, agility: 1.3, stars: 5 },
  { id: "sea_serpent", s: "🐉", n: "Sea Serpent", p: 100000, c: 0.0005, clicks: 250, speed: 250, decay: 2.5, agility: 2.2, stars: 5 }
];

const RODS = [
  { name: "Twig Pole", power: 1, price: 0 },
  { name: "Fiberglass", power: 2, price: 100 },
  { name: "Carbon Fiber", power: 4, price: 2500 },
  { name: "Master Rod", power: 8, price: 10000 },
  { name: "The Trident", power: 10, price: 10000 }
];

let gold = 0, inventory = [], discovered = new Set(), currentRod = RODS[0];
let activeFish = null, clicksLeft = 0, totalNeeded = 0, battleActive = false, decayInterval = null;
let currentFishType = null;

// Track Mouse Position for Evasion AI
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
  const rect = document.getElementById('device').getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

function log(text, color = "var(--green)") {
  const msgLog = document.getElementById("msg-log");
  msgLog.innerText = text;
  msgLog.style.color = color;
  msgLog.classList.remove("msg-fade");
  void msgLog.offsetWidth; // Trigger reflow to restart animation
  msgLog.classList.add("msg-fade");
}

function spawnFish() {
  if (activeFish) activeFish.remove();
  if (decayInterval) clearInterval(decayInterval);
  battleActive = false;
  totalNeeded = 0;
  
  document.getElementById("catch-ui").style.display = "none";
  document.getElementById("catch-progress").style.width = "0%";
  
  const rand = Math.random();
  let cumulative = 0;
  currentFishType = FISH_TYPES[0];
  for (const f of FISH_TYPES) {
    cumulative += f.c;
    if (rand < cumulative) { currentFishType = f; break; }
  }

  const el = document.createElement("div");
  el.className = "fish";
  el.innerText = currentFishType.s;
  el.style.left = Math.random() * 400 + "px";
  el.style.top = Math.random() * 250 + "px";

  el.onclick = (e) => { e.stopPropagation(); startBattle(currentFishType, el); };
  document.getElementById("game-port").appendChild(el);
  activeFish = el;

  moveFishAI();
}

window.toggleMenu = function() {
  const side = document.getElementById("sidebar");
  const btn = document.getElementById("menu-toggle");
  
  const anyPageOpen = document.querySelector(".sub-page.active");
  if (anyPageOpen) {
    window.closePage();
    return;
  }

  side.classList.toggle("open");
  btn.innerText = side.classList.contains("open") ? "✕" : "≡";
};

window.showPage = function(id) {
  const side = document.getElementById("sidebar");
  side.classList.remove("open");
  document.getElementById("menu-toggle").innerText = "✕";
  document.getElementById(id).classList.add("active");
  window.updateUI(); 
};

window.closePage = function() {
  document.querySelectorAll(".sub-page").forEach(p => p.classList.remove("active"));
  document.getElementById("menu-toggle").innerText = "≡";
  document.getElementById("sidebar").classList.remove("open");
};

window.sellAll = function() {
  const total = inventory.reduce((sum, f) => sum + f.p, 0);
  gold += total;
  inventory = [];
  log(`SOLD CATCH FOR $${total}`);
  window.updateUI();
};

window.closeApp = () => {
  const { remote } = require('electron'); // Note: Only works if enableRemoteModule is true
  // Better way for modern Electron:
  window.close(); 
};

window.buyRod = function(name) {
  const rod = RODS.find(r => r.name === name);
  if (gold >= rod.price && currentRod.name !== rod.name) {
    gold -= rod.price;
    currentRod = rod;
    window.updateUI();
    saveGame(); // AUTO-SAVE
  }
};


const STICKERS = [
  { id: "star", s: "⭐", p: 50 },
  { id: "heart", s: "❤️", p: 50 },
  { id: "fire", s: "🔥", p: 150 },
  { id: "skull", s: "💀", p: 300 },
  { id: "crown", s: "👑", p: 1000 },
  { id: "alien", s: "👽", p: 2500 },
  { id: "diamond", s: "💎", p: 5000 }
];

let myStickers = [];

// Add this to your updateUI function
function updateStickerShop() {
  const list = document.getElementById("sticker-shop-list");
  list.innerHTML = STICKERS.map(s => `
    <div class="shop-item">
      <span>${s.s} Sticker</span>
      <button class="menu-item" style="width:auto; margin:0; padding:5px 10px;" 
        onclick="buySticker('${s.id}')" ${gold < s.p ? 'disabled' : ''}>
        BUY $${s.p}
      </button>
    </div>
  `).join("");
}

// Modify your existing updateUI to call this
const originalUpdateUI = updateUI;
updateUI = function() {
  originalUpdateUI();
  updateStickerShop();
};

window.buySticker = function(id) {
  const sticker = STICKERS.find(s => s.id === id);
  if (gold >= sticker.p) {
    gold -= sticker.p;
    placeSticker(sticker.s);
    log(`BOUGHT ${sticker.s} STICKER!`);
    updateUI();
    saveGame(); // AUTO-SAVE
  }
};

function placeSticker(symbol) {
  const layer = document.getElementById("sticker-layer");
  const el = document.createElement("div");
  el.className = "sticker";
  el.innerText = symbol;
  
  // Default placement (Center)
  el.style.left = "230px";
  el.style.top = "150px";
  el.style.transform = `rotate(${Math.random() * 40 - 20}deg)`;

  // Add Dragging Event Listeners
  el.addEventListener('mousedown', startStickerDrag);

  layer.appendChild(el);
}

let activeSticker = null;
let offset = { x: 0, y: 0 };

function startStickerDrag(e) {
  activeSticker = e.target;
  // Calculate offset so the sticker doesn't "jump" to the cursor corner
  const rect = activeSticker.getBoundingClientRect();
  const deviceRect = document.getElementById('device').getBoundingClientRect();
  
  offset.x = e.clientX - rect.left;
  offset.y = e.clientY - rect.top;
  
  document.addEventListener('mousemove', dragSticker);
  document.addEventListener('mouseup', stopStickerDrag);
}

function dragSticker(e) {
  if (!activeSticker) return;
  
  const deviceRect = document.getElementById('device').getBoundingClientRect();
  
  // Calculate new position relative to the device container
  let newX = e.clientX - deviceRect.left - offset.x;
  let newY = e.clientY - deviceRect.top - offset.y;

  // Optional: keep stickers within device bounds
  newX = Math.max(-10, Math.min(480, newX));
  newY = Math.max(-10, Math.min(330, newY));

  activeSticker.style.left = newX + "px";
  activeSticker.style.top = newY + "px";
}

function stopStickerDrag() {
  activeSticker = null;
  document.removeEventListener('mousemove', dragSticker);
  document.removeEventListener('mouseup', stopStickerDrag);
  saveGame(); // AUTO-SAVE
}

function moveFishAI() {
  if (!activeFish || !activeFish.parentNode) return;

  const fishX = parseFloat(activeFish.style.left);
  const fishY = parseFloat(activeFish.style.top);
  const dx = mouseX - fishX;
  const dy = mouseY - fishY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  let nextX = fishX;
  let nextY = fishY;

  // --- REWARD MECHANIC: The "Rest" Chance ---
  // 30% chance the fish stays still for a moment, giving the player a window.
  if (battleActive && Math.random() < 0.3) {
    setTimeout(moveFishAI, 400); 
    return;
  }

  if (battleActive) {
    // Lowered intensity so it's not impossible to track
    const struggleIntensity = currentFishType.agility * 40; 
    nextX += (Math.random() - 0.5) * struggleIntensity;
    nextY += (Math.random() - 0.5) * struggleIntensity;
    activeFish.style.transition = "all 0.3s ease-out"; // Slightly slower for fairness
  } else {
    activeFish.style.transition = "top 2s linear, left 2s linear";
    // Only move away if mouse is very close (reduced from 120 to 80)
    if (dist < 80) {
      const moveX = (dx / dist) * (currentFishType.agility * 60);
      const moveY = (dy / dist) * (currentFishType.agility * 60);
      nextX -= moveX;
      nextY -= moveY;
    } else {
      nextX += (Math.random() - 0.5) * 20;
      nextY += (Math.random() - 0.5) * 20;
    }
  }

  nextX = Math.max(20, Math.min(440, nextX));
  nextY = Math.max(60, Math.min(280, nextY));

  activeFish.style.left = nextX + "px";
  activeFish.style.top = nextY + "px";

  // Slower reaction times to give player time to move their hand
  let reactionTime = battleActive ? 400 : 600;
  setTimeout(moveFishAI, reactionTime);
}

let decayPaused = false;

function startBattle(type, el) {
  if (!battleActive) {
    battleActive = true;
    totalNeeded = type.clicks;
    clicksLeft = totalNeeded * 0.2; // Start with 20% progress already filled
    document.getElementById('sticker-layer').style.pointerEvents = 'none';
    document.getElementById("catch-ui").style.display = "block";
    
    decayInterval = setInterval(() => {
      if (!decayPaused) { // Only decay if not paused
        clicksLeft -= type.decay;
        if (clicksLeft <= 0) fishEscaped();
        updateCatchBar();
      }
    }, 100);
  }

  // --- FAIRNESS: Click Buffer ---
  // Every click pauses decay briefly so you don't lose progress while chasing the fish
  decayPaused = true;
  setTimeout(() => { decayPaused = false; }, 400);

  clicksLeft += currentRod.power;
  if (clicksLeft >= totalNeeded) fishCaught(type);
  updateCatchBar();
}

function updateCatchBar() {
  const progress = Math.min(Math.max((clicksLeft / totalNeeded) * 100, 0), 100);
  document.getElementById("catch-progress").style.width = `${progress}%`;
}

function fishCaught(type) {
  inventory.push(type);
  discovered.add(type.id);
  log(`CAUGHT: ${type.s} ${type.n}!`, "var(--green)");
  spawnFish();
  updateUI();
  saveGame(); // AUTO-SAVE
}

function fishEscaped() {
  log(`LOST: It got away...`, "#f00");
  spawnFish();
}

function updateUI() {
  document.getElementById("gold").innerText = gold;
  document.getElementById("rod-name").innerText = currentRod.name;
  
  document.getElementById("bestiary-list").innerHTML = FISH_TYPES.map(f => 
    `<div style="opacity:${discovered.has(f.id)?1:0.2}">${discovered.has(f.id)?f.s+' '+f.n:'? Unknown'}</div>`
  ).join("");

  document.getElementById("inv-list").innerHTML = inventory.length > 0 
    ? inventory.map(f => `<div>${f.s} ${f.n} ($${f.p})</div>`).join("")
    : "Your bucket is empty...";

  document.getElementById("shop-list").innerHTML = RODS.map(r => `
    <div class="shop-item">
      <b>${r.name}</b> (Power: ${r.power})<br>
      <button onclick="buyRod('${r.name}')" ${gold < r.price || currentRod.name === r.name ? 'disabled' : ''}>
        ${currentRod.name === r.name ? 'OWNED' : 'BUY $' + r.price}
      </button>
    </div>
  `).join("");
}

// --- SAVING LOGIC ---
function saveGame() {
  const stickerData = [];
  document.querySelectorAll(".sticker").forEach((el) => {
    stickerData.push({
      s: el.innerText,
      left: el.style.left,
      top: el.style.top,
      transform: el.style.transform,
    });
  });

  const gameState = {
    gold: gold,
    inventory: inventory,
    discovered: Array.from(discovered),
    currentRodName: currentRod.name,
    stickers: stickerData,
  };

  localStorage.setItem("pixel_fishing_save", JSON.stringify(gameState));
}

function loadGame() {
  const savedData = localStorage.getItem("pixel_fishing_save");
  if (!savedData) return;

  const data = JSON.parse(savedData);

  // Restore Gold & Rod
  gold = data.gold;
  inventory = data.inventory || [];
  discovered = new Set(data.discovered || []);
  currentRod = RODS.find((r) => r.name === data.currentRodName) || RODS[0];

  // Restore Stickers
  const layer = document.getElementById("sticker-layer");
  layer.innerHTML = "";
  if (data.stickers) {
    data.stickers.forEach((s) => {
      const el = document.createElement("div");
      el.className = "sticker";
      el.innerText = s.s;
      el.style.left = s.left;
      el.style.top = s.top;
      el.style.transform = s.transform;
      el.addEventListener("mousedown", startStickerDrag);
      layer.appendChild(el);
    });
  }

  updateUI();
}

// Start
loadGame();
spawnFish();
updateUI();