const stage = document.querySelector('#townStage');
const person = document.querySelector('#pixelPerson');
const hint = document.querySelector('#locationHint');
const dialog = document.querySelector('#placeDialog');
const dialogTitle = document.querySelector('#dialogTitle');
const characterStudio = document.querySelector('#characterStudio');
const previewTarget = document.querySelector('#studioCharacterPreview');
const profileAvatar = document.querySelector('#profileAvatar');
const customizerGroups = document.querySelector('#customizerGroups');
const saveNote = document.querySelector('#studioSaveNote');

// Waypoints are normalized to the 1536 × 1024 background; adjust these independently of layout.
const route = [
  { x: 38, y: 48, state: 'walk' }, { x: 38, y: 56, state: 'look' },
  { x: 42, y: 66, state: 'walk' }, { x: 51, y: 69, state: 'wait' },
  { x: 60, y: 68, state: 'walk' }, { x: 65, y: 61, state: 'look' },
  { x: 64, y: 52, state: 'walk' }, { x: 62, y: 43, state: 'wait' },
  { x: 61, y: 38, state: 'walk' }, { x: 64, y: 49, state: 'look' },
  { x: 38, y: 48, state: 'idle' }
];
const places = {
  'post-office': 'POST OFFICE', 'winter-cafe': 'WINTER CAFE', 'gift-shop': 'GIFT SHOP',
  'my-house': 'MY HOUSE', 'town-square': 'TOWN SQUARE'
};

function setCharacter(x, y, facing = 1) {
  person.style.left = `${x}%`;
  person.style.top = `${y}%`;
  person.style.transform = `translate(-50%, -50%) scaleX(${facing})`;
  person.dataset.direction = facing < 0 ? 'left' : 'right';
}

const DEFAULT_CHARACTER = {
  face: 'warm', hair: 'soft-bob', hairColor: 'chestnut',
  top: 'berry-coat', bottom: 'snow-skirt', shoes: 'winter-boots', accessory: 'snowflake-clip'
};
const STORAGE_KEY = 'decemberTown.character:local';
let draftCharacter = readSavedCharacter();
let savedCharacter = { ...draftCharacter };

function normalizeCharacter(candidate) {
  const clean = {};
  Object.entries(DEFAULT_CHARACTER).forEach(([category, fallback]) => {
    const available = window.CHARACTER_ITEMS[category].some(item => item.id === candidate?.[category]);
    clean[category] = available ? candidate[category] : fallback;
  });
  return clean;
}

function readSavedCharacter() {
  try {
    return normalizeCharacter(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || DEFAULT_CHARACTER);
  } catch {
    return { ...DEFAULT_CHARACTER };
  }
}

function createPartImage(part, className, alt = '') {
  const image = document.createElement('img');
  image.className = `sprite-part ${className}`;
  image.src = part.src;
  image.alt = alt;
  image.draggable = false;
  return image;
}

function drawCharacter(target, character, compact = false) {
  const chosen = normalizeCharacter(character);
  const items = window.CHARACTER_ITEMS;
  const art = window.CHARACTER_ART;
  const sprite = document.createElement('div');
  sprite.className = `character-sprite${compact ? ' compact-sprite' : ''}`;
  sprite.setAttribute('aria-hidden', 'true');

  const shoes = items.shoes.find(item => item.id === chosen.shoes);
  const bottom = items.bottom.find(item => item.id === chosen.bottom);
  const top = items.top.find(item => item.id === chosen.top);
  const hair = items.hair.find(item => item.id === chosen.hair);
  const face = items.face.find(item => item.id === chosen.face);
  const accessory = items.accessory.find(item => item.id === chosen.accessory);
  const hairColor = items.hairColor.find(item => item.id === chosen.hairColor);

  sprite.append(createPartImage(art.shoes[shoes.id], 'shoes-part'));
  sprite.append(createPartImage(art.bottom[bottom.id], 'bottom-part'));
  sprite.append(createPartImage(art.top[top.id], 'top-part'));

  const hairPart = document.createElement('div');
  hairPart.className = 'sprite-part hair-part';
  hairPart.style.setProperty('--hair-mask', `url("${art.hair[hair.id].src}")`);
  hairPart.style.setProperty('--hair-color', hairColor.value);
  sprite.append(hairPart);

  sprite.append(createPartImage(art.face[face.id], 'face-part'));
  sprite.append(createPartImage(art.accessory[accessory.id], 'accessory-part'));
  target.replaceChildren(sprite);
}

function renderChoices() {
  customizerGroups.replaceChildren();
  const categoryLabels = {
    face: '얼굴', hair: '헤어스타일', hairColor: '머리색', top: '상의',
    bottom: '하의', shoes: '신발', accessory: '액세서리'
  };
  Object.entries(categoryLabels).forEach(([category, label]) => {
    const group = document.createElement('section');
    group.className = 'choice-group';
    group.dataset.category = category;
    const heading = document.createElement('h3');
    heading.textContent = label;
    const options = document.createElement('div');
    options.className = `choice-options ${category === 'hairColor' ? 'color-options' : ''}`;
    window.CHARACTER_ITEMS[category].forEach(item => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'choice-option';
      option.dataset.category = category;
      option.dataset.value = item.id;
      option.setAttribute('aria-pressed', String(draftCharacter[category] === item.id));
      option.setAttribute('aria-label', `${label}: ${item.label}`);
      if (category === 'hairColor') {
        option.classList.add('color-choice');
        option.style.setProperty('--choice-color', item.value);
        option.innerHTML = `<span class="color-swatch"></span><span>${item.label}</span>`;
      } else {
        option.innerHTML = `<span class="choice-glyph" aria-hidden="true">${item.icon}</span><span>${item.label}</span>`;
      }
      option.addEventListener('click', () => {
        draftCharacter[category] = item.id;
        updateStudio();
      });
      options.append(option);
    });
    group.append(heading, options);
    customizerGroups.append(group);
  });
}

function updateStudio() {
  drawCharacter(previewTarget, draftCharacter);
  customizerGroups.querySelectorAll('.choice-option').forEach(option => {
    option.setAttribute('aria-pressed', String(draftCharacter[option.dataset.category] === option.dataset.value));
  });
  saveNote.textContent = '저장하면 마을과 프로필에 적용돼요.';
  saveNote.classList.remove('saved');
}

function openStudio() {
  draftCharacter = { ...savedCharacter };
  updateStudio();
  characterStudio.showModal();
}

function randomizeCharacter() {
  Object.keys(DEFAULT_CHARACTER).forEach(category => {
    const choices = window.CHARACTER_ITEMS[category];
    draftCharacter[category] = choices[Math.floor(Math.random() * choices.length)].id;
  });
  updateStudio();
}

function saveCharacter() {
  savedCharacter = normalizeCharacter(draftCharacter);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCharacter));
  drawCharacter(person, savedCharacter);
  drawCharacter(profileAvatar, savedCharacter, true);
  saveNote.textContent = '저장했어요! 마을과 프로필에 적용됐어요.';
  saveNote.classList.add('saved');
  window.setTimeout(() => characterStudio.close(), 600);
}

function pause(ms) { return new Promise(resolve => window.setTimeout(resolve, ms)); }
async function travelTo(point) {
  const currentX = parseFloat(person.style.left) || route[0].x;
  const currentY = parseFloat(person.style.top) || route[0].y;
  const distance = Math.hypot(point.x - currentX, point.y - currentY);
  const duration = Math.max(750, distance * 86);
  person.dataset.state = 'WALK';
  person.classList.add('walking');
  setCharacter(currentX, currentY, point.x >= currentX ? 1 : -1);
  await new Promise(resolve => {
    const animation = person.animate([
      { left: `${currentX}%`, top: `${currentY}%` },
      { left: `${point.x}%`, top: `${point.y}%` }
    ], { duration, easing: 'linear', fill: 'forwards' });
    animation.onfinish = () => {
      animation.cancel();
      setCharacter(point.x, point.y, point.x >= currentX ? 1 : -1);
      resolve();
    };
  });
  person.classList.remove('walking');
  person.dataset.state = point.state.toUpperCase();
  await pause(({ idle: 4200, wait: 2600, look: 1900, walk: 450 })[point.state]);
}

async function wander() {
  let index = 0;
  while (true) {
    await travelTo(route[index]);
    index = (index + 1) % route.length;
  }
}

document.querySelectorAll('.hotspot').forEach(button => {
  button.addEventListener('click', () => {
    const place = places[button.dataset.place];
    dialogTitle.textContent = place;
    dialog.showModal();
  });
});
document.querySelector('#characterStudioOpen').addEventListener('click', openStudio);
document.querySelector('#studioClose').addEventListener('click', () => characterStudio.close());
document.querySelector('#randomCharacter').addEventListener('click', randomizeCharacter);
document.querySelector('#resetCharacter').addEventListener('click', () => {
  draftCharacter = { ...DEFAULT_CHARACTER };
  updateStudio();
});
document.querySelector('#saveCharacter').addEventListener('click', saveCharacter);
characterStudio.addEventListener('click', event => {
  if (event.target === characterStudio) characterStudio.close();
});
document.querySelector('#dialogClose').addEventListener('click', () => dialog.close());
document.querySelector('#dialogOk').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
document.querySelectorAll('.nav-item').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    if (button.dataset.menu !== 'my-town') {
      dialogTitle.textContent = ({ friends: 'FRIENDS', mail: 'MAIL', memories: 'MEMORIES' })[button.dataset.menu];
      dialog.showModal();
      document.querySelector('.nav-item[data-menu="my-town"]').classList.remove('active');
    }
  });
});

const labels = { 'post-office': 'POST OFFICE', 'winter-cafe': 'WINTER CAFE', 'gift-shop': 'GIFT SHOP', 'my-house': 'MY HOUSE', 'town-square': 'TOWN SQUARE' };
document.querySelectorAll('.hotspot').forEach(button => {
  button.addEventListener('pointerenter', () => { hint.innerHTML = `${labels[button.dataset.place]} <span>✦</span>`; });
  button.addEventListener('pointerleave', () => { hint.innerHTML = '마을을 둘러보세요 <span>✦</span>'; });
});

// Keep the fixed-coordinate map and interaction layer locked to the source artwork.
const background = document.querySelector('.town-background');
background.addEventListener('load', () => {
  stage.style.setProperty('--source-width', background.naturalWidth);
  stage.style.setProperty('--source-height', background.naturalHeight);
}, { once: true });
setCharacter(route[0].x, route[0].y);
renderChoices();
drawCharacter(previewTarget, draftCharacter);
drawCharacter(person, savedCharacter);
drawCharacter(profileAvatar, savedCharacter, true);
wander();
