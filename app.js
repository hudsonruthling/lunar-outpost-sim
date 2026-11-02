const siteData = {
  moon: {
    name: 'Moon',
    goal: 24,
    story:
      'The Moon is close enough to help us test life support, but it still has big temperature swings and a risky radiation environment. Every power choice matters when the sun is strong and the habitat must stay warm and safe.',
    habitatBonus: 0,
    radiation: 0.9,
    weather: ['Quiet', 'Solar flare watch', 'Lunar dust burst'],
    delay: '2 min'
  },
  mars: {
    name: 'Mars',
    goal: 30,
    story:
      'Mars has longer communication delays and dust storms that can block power and limit decisions. The challenge is to balance life support, radiation protection, and crop production while the mission stretches across many sols.',
    habitatBonus: 4,
    radiation: 1.3,
    weather: ['Calm', 'Dust storm', 'High solar activity'],
    delay: '20 min'
  }
};

const resourceLabels = {
  oxygen: 'Oxygen',
  water: 'Water',
  food: 'Food',
  power: 'Power',
  radiation: 'Radiation Shield',
  science: 'Science',
  stability: 'Habitat stability'
};

const state = {
  site: 'moon',
  day: 1,
  endDay: 24,
  maxDays: 24,
  messageLog: [],
  resources: {
    oxygen: 100,
    water: 85,
    food: 80,
    power: 90,
    radiation: 28,
    science: 0,
    stability: 100
  },
  weatherIndex: 0,
  missionState: 'active'
};

const resourceOrder = ['oxygen', 'water', 'food', 'power', 'radiation', 'science'];

const logList = document.getElementById('logList');
const resourceGrid = document.getElementById('resourceGrid');
const siteBadge = document.getElementById('siteBadge');
const dayValue = document.getElementById('dayValue');
const goalValue = document.getElementById('goalValue');
const weatherValue = document.getElementById('weatherValue');
const delayValue = document.getElementById('delayValue');
const siteStory = document.getElementById('siteStory');
const stabilityValue = document.getElementById('stabilityValue');

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function setSite(siteKey) {
  const site = siteData[siteKey];
  state.site = siteKey;
  state.endDay = site.goal;
  state.maxDays = site.goal;
  siteBadge.textContent = site.name;
  goalValue.textContent = `Survive ${site.goal} days`;
  delayValue.textContent = site.delay;
  siteStory.textContent = site.story;
  addLog(`Mission begins on ${site.name}. The crew is ready to manage power, food, and radiation.`, true);
  render();
}

function addLog(message, important = false) {
  const entry = { message, important };
  state.messageLog.unshift(entry);
  state.messageLog = state.messageLog.slice(0, 12);
  renderLog();
}

function renderLog() {
  logList.innerHTML = state.messageLog
    .map(
      (entry) =>
        `<li style="border-left-color:${entry.important ? 'var(--warning)' : 'var(--accent)'}">${entry.message}</li>`
    )
    .join('');
}

function makeResourceCard(key, value) {
  const capitalName = resourceLabels[key] || key;
  const percent = clamp(value);
  let color = 'linear-gradient(90deg, var(--accent), var(--accent-2))';

  if (key === 'power') color = 'linear-gradient(90deg, #94d8ff, #59b8ff)';
  if (key === 'oxygen') color = 'linear-gradient(90deg, #8ae6ff, #52d2b3)';
  if (key === 'food') color = 'linear-gradient(90deg, #c7f17a, #83df7d)';
  if (key === 'radiation') color = 'linear-gradient(90deg, #ffd388, #ff9a60)';
  if (key === 'science') color = 'linear-gradient(90deg, #d7b8ff, #8b8bfd)';

  return `
    <div class="resource-item">
      <div class="resource-topline">
        <span class="resource-name">${capitalName}</span>
        <span class="resource-value">${Math.round(value)}%</span>
      </div>
      <div class="resource-bar"><div class="resource-fill" style="width: ${percent}%; background: ${color};"></div></div>
    </div>
  `;
}

function renderResources() {
  resourceGrid.innerHTML = resourceOrder
    .map((key) => makeResourceCard(key, state.resources[key]))
    .join('');
}

function render() {
  renderResources();
  dayValue.textContent = state.day;
  weatherValue.textContent = siteData[state.site].weather[state.weatherIndex];
  const stability = clamp((state.resources.oxygen + state.resources.water + state.resources.food + state.resources.power) / 4);
  state.resources.stability = stability;
  stabilityValue.textContent = `${Math.round(stability)}%`;
  renderLog();
}

function updateResource(resource, delta) {
  state.resources[resource] = clamp(state.resources[resource] + delta);
}

function triggerHazard() {
  const site = siteData[state.site];
  const roll = Math.random();

  if (state.site === 'moon') {
    if (roll < 0.35) {
      state.weatherIndex = 1;
      const shieldMitigation = Math.max(0, state.resources.radiation - 20) / 100;
      const damage = Math.round(14 - shieldMitigation * 10);
      updateResource('oxygen', -damage / 2);
      updateResource('power', -10);
      addLog(`Solar flare watch! Radiation spikes. The habitat loses ${damage} oxygen and power reserves dip.`);
    } else if (roll < 0.7) {
      state.weatherIndex = 2;
      updateResource('power', -8);
      updateResource('water', -6);
      addLog('A lunar dust burst rattles equipment. Filters take a hit, water recovery drops, and power use climbs.');
    } else {
      state.weatherIndex = 0;
      addLog('The solar weather stays calm. Crew members use the quiet time to inspect systems and rest.');
    }
  } else {
    if (roll < 0.3) {
      state.weatherIndex = 1;
      updateResource('power', -18);
      updateResource('food', -8);
      addLog('A dust storm swells over the outpost. Solar panels lose output and the greenhouse needs extra support.');
    } else if (roll < 0.65) {
      state.weatherIndex = 2;
      const shieldMitigation = Math.max(0, state.resources.radiation - 25) / 100;
      const damage = Math.round(20 - shieldMitigation * 8);
      updateResource('oxygen', -damage / 2);
      updateResource('science', +4);
      addLog(`High solar activity! The crew takes a radiation hit, but they also gather extra science before the event passes.`);
    } else {
      state.weatherIndex = 0;
      updateResource('water', +8);
      addLog('Open skies and stable weather let the crew recover water and check equipment.');
    }
  }
}

function applyDailyCosts() {
  const site = siteData[state.site];
  updateResource('oxygen', -6 + site.habitatBonus * 0.1);
  updateResource('water', -5);
  updateResource('food', -4);
  updateResource('power', -10 + (state.site === 'mars' ? 2 : 0));
  updateResource('radiation', +Math.max(0, 2 - Math.floor(state.resources.radiation / 35)));

  if (state.resources.radiation > 60) {
    updateResource('oxygen', -7);
    updateResource('stability', -7);
  }

  if (state.resources.power < 25) {
    updateResource('oxygen', -7);
    updateResource('water', -5);
    addLog('Power is too low. Life support has to work harder and the crew feels the strain.');
  }

  if (state.resources.food < 25) {
    updateResource('stability', -6);
    addLog('Food stores are falling. The crew is getting hungry and morale drops.');
  }

  if (state.resources.water < 20) {
    updateResource('oxygen', -8);
    addLog('Water recycling is near the limit. The habitat will need extra attention soon.');
  }
}

function checkMissionEnd() {
  if (state.resources.oxygen <= 0 || state.resources.food <= 0 || state.resources.power <= 0 || state.resources.water <= 0) {
    addLog('Mission failed. The outpost could not sustain its crew through the harsh conditions.', true);
    state.missionState = 'lost';
    return true;
  }

  if (state.day >= state.maxDays) {
    if (state.resources.stability > 55 && state.resources.food > 35 && state.resources.oxygen > 35) {
      addLog(`Mission success! The outpost lasts through ${state.maxDays} days and remains stable enough for the next crew.`, true);
      state.missionState = 'won';
      return true;
    }
    addLog('The crew survived, but the outpost is too fragile for long-term settlement. The mission must be revised.', true);
    state.missionState = 'lost';
    return true;
  }

  return false;
}

function runAction(action) {
  if (state.missionState !== 'active') return;

  const site = siteData[state.site];

  switch (action) {
    case 'lifeSupport':
      updateResource('oxygen', +11);
      updateResource('water', +8);
      updateResource('power', -14);
      addLog('Life support runs at full efficiency. Crew air and water stay steady, but power drains more quickly.');
      break;
    case 'shield':
      updateResource('radiation', +18);
      updateResource('power', -12);
      updateResource('water', -4);
      addLog('Shielding layers are reinforced. The habitat is safer from radiation, but energy and water budgets tighten.');
      break;
    case 'greenhouse':
      updateResource('food', +16);
      updateResource('power', -10);
      updateResource('water', -12);
      addLog('The greenhouse produces food, but it uses extra water and electricity. This helps the mission last longer.');
      break;
    case 'science':
      updateResource('science', +18);
      updateResource('power', -8);
      updateResource('radiation', +6);
      addLog('Scientists run a new experiment. The crew learns more, but the radiation risk rises a little.');
      break;
    case 'repair':
      updateResource('power', -6);
      updateResource('oxygen', +5);
      updateResource('stability', +10);
      addLog('Repair crews restore damaged systems and reduce habitat stress. The outpost feels steadier.');
      break;
    case 'rest':
      updateResource('power', +10);
      updateResource('oxygen', -2);
      updateResource('stability', +4);
      addLog('The crew takes a low-energy rotation and saves power for the next challenge.');
      break;
    default:
      break;
  }

  state.weatherIndex = 0;
  triggerHazard();
  applyDailyCosts();
  state.day += 1;

  if (state.day > state.maxDays) {
    state.day = state.maxDays;
  }

  if (state.day <= state.maxDays) {
    addLog(`Day ${state.day} begins on ${site.name}. The next decisions will matter.`);
  }

  if (checkMissionEnd()) {
    return;
  }

  render();
}

function resetGame() {
  state.day = 1;
  state.weatherIndex = 0;
  state.messageLog = [];
  state.missionState = 'active';
  state.resources = {
    oxygen: 100,
    water: 85,
    food: 80,
    power: 90,
    radiation: 28,
    science: 0,
    stability: 100
  };
  setSite(state.site);
  addLog('Crew assigned. Your first planning cycle begins now.', true);
  render();
}

const buttons = document.querySelectorAll('.action-btn');
buttons.forEach((button) => {
  button.addEventListener('click', () => runAction(button.dataset.action));
});

document.getElementById('resetButton').addEventListener('click', resetGame);

const moonButton = document.createElement('button');
moonButton.className = 'secondary-btn';
moonButton.style.marginRight = '10px';
moonButton.textContent = 'Moon site';
moonButton.addEventListener('click', () => {
  state.site = 'moon';
  resetGame();
});

const marsButton = document.createElement('button');
marsButton.className = 'secondary-btn';
marsButton.textContent = 'Mars site';
marsButton.addEventListener('click', () => {
  state.site = 'mars';
  resetGame();
});

const dataPanel = document.querySelector('.data-panel');
const siteSelector = document.createElement('div');
siteSelector.style.display = 'flex';
siteSelector.style.gap = '10px';
siteSelector.style.marginBottom = '12px';
siteSelector.append(moonButton, marsButton);
dataPanel.prepend(siteSelector);

setSite('moon');
resetGame();
