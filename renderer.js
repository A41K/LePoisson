const FISH_TYPES = [
  { id: "minnow", s: "🐟", n: "Minnow", p: 5, c: 0.3, clicks: 3, speed: 2500, decay: 0.1, agility: 0.1 },
  { id: "cod", s: "🐟", n: "Cod", p: 12, c: 0.15, clicks: 4, speed: 2000, decay: 0.15, agility: 0.2 },
  { id: "clown", s: "🤡", n: "Clownfish", p: 25, c: 0.1, clicks: 5, speed: 1800, decay: 0.2, agility: 0.3 },
  { id: "salmon", s: "🐟", n: "Salmon", p: 40, c: 0.08, clicks: 6, speed: 1500, decay: 0.25, agility: 0.4 },
  { id: "tuna", s: "🍣", n: "Tuna", p: 60, c: 0.06, clicks: 8, speed: 1200, decay: 0.3, agility: 0.5 },
  { id: "blowfish", s: "🐡", n: "Blowfish", p: 100, c: 0.05, clicks: 10, speed: 1000, decay: 0.4, agility: 0.7 },
  { id: "eel", s: "🐍", n: "Eel", p: 150, c: 0.04, clicks: 12, speed: 800, decay: 0.5, agility: 0.8 },
  { id: "octopus", s: "🐙", n: "Octopus", p: 250, c: 0.03, clicks: 15, speed: 700, decay: 0.6, agility: 0.9 },
  { id: "shark", s: "🦈", n: "Shark", p: 500, c: 0.02, clicks: 25, speed: 500, decay: 0.8, agility: 1.2 },
  { id: "whale", s: "🐋", n: "Whale", p: 1000, c: 0.01, clicks: 40, speed: 400, decay: 1.0, agility: 1.5 },
  { id: "marlin", s: "🗡️", n: "Marlin", p: 450, c: 0.03, clicks: 20, speed: 600, decay: 0.7, agility: 1.1 },
  { id: "crab", s: "🦀", n: "Crab", p: 30, c: 0.1, clicks: 4, speed: 2200, decay: 0.2, agility: 0.2 },
  { id: "lobster", s: "🦞", n: "Lobster", p: 80, c: 0.05, clicks: 7, speed: 1400, decay: 0.3, agility: 0.4 },
  { id: "squid", s: "🦑", n: "Squid", p: 200, c: 0.04, clicks: 11, speed: 900, decay: 0.45, agility: 0.6 },
  { id: "dolphin", s: "🐬", n: "Dolphin", p: 600, c: 0.02, clicks: 30, speed: 500, decay: 0.9, agility: 1.3 }
];

const RODS = [
  { name: "Twig Pole", power: 1, price: 0 },
  { name: "Fiberglass", power: 2, price: 200 },
  { name: "Carbon Fiber", power: 4, price: 1000 },
  { name: "Master Rod", power: 10, price: 5000 }
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

// Ensure these functions are available globally for HTML onclicks
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

window.buyRod = function(name) {
  const rod = RODS.find(r => r.name === name);
  if (gold >= rod.price && currentRod.name !== rod.name) {
    gold -= rod.price;
    currentRod = rod;
    window.updateUI();
  }
};

function moveFishAI() {
  if (!activeFish || !activeFish.parentNode) return;

  const fishX = parseFloat(activeFish.style.left);
  const fishY = parseFloat(activeFish.style.top);
  
  // Distance from mouse
  const dx = mouseX - fishX;
  const dy = mouseY - fishY;
  const dist = Math.sqrt(dx*dx + dy*dy);

  let nextX = fishX;
  let nextY = fishY;

  // EVASION: If mouse is close, run away!
  if (dist < 150) {
    const moveX = (dx / dist) * (currentFishType.agility * 80);
    const moveY = (dy / dist) * (currentFishType.agility * 80);
    nextX -= moveX;
    nextY -= moveY;
  } else {
    // Random idle drifting
    nextX += (Math.random() - 0.5) * 50;
    nextY += (Math.random() - 0.5) * 50;
  }

  // Keep in bounds
  nextX = Math.max(10, Math.min(460, nextX));
  nextY = Math.max(50, Math.min(280, nextY));

  activeFish.style.left = nextX + "px";
  activeFish.style.top = nextY + "px";

  // Agility affects how fast the AI "thinks"
  const thinkSpeed = battleActive ? 100 : Math.max(200, currentFishType.speed / 5);
  setTimeout(moveFishAI, thinkSpeed);
}

function startBattle(type, el) {
  if (!battleActive) {
    battleActive = true;
    totalNeeded = type.clicks;
    clicksLeft = 1;
    document.getElementById("catch-ui").style.display = "block";
    
    decayInterval = setInterval(() => {
      clicksLeft -= type.decay;
      if (clicksLeft <= 0) fishEscaped();
      updateCatchBar();
    }, 100);
  }

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

function buyRod(name) {
  const rod = RODS.find(r => r.name === name);
  if (gold >= rod.price && currentRod.name !== rod.name) {
    gold -= rod.price;
    currentRod = rod;
    updateUI();
  }
}

function sellAll() {
  const total = inventory.reduce((sum, f) => sum + f.p, 0);
  gold += total;
  inventory = [];
  alert(`Sold all fish for $${total}!`);
  updateUI();
}

// Start
spawnFish();
updateUI();