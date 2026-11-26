const stage = document.querySelector('#townStage');
const person = document.querySelector('#pixelPerson');
const hint = document.querySelector('#locationHint');
const dialog = document.querySelector('#placeDialog');
const dialogTitle = document.querySelector('#dialogTitle');

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
wander();
