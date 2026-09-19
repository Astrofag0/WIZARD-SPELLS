const sessionKey = 'wizard-spells-character';
const view = document.body.dataset.view || 'inventory';
const characters = {
  vaelis: { name: 'Vaelis', key: 'Miaw', root: './', workbook: 'Wizard Spells.xlsx', imageFolder: 'imagenes/', background: 'fondos/wizard fondo.png' },
  viko: { name: 'Viko', key: 'paladin', root: '../Viko/', workbook: 'Paladin Spells.xlsx', imageFolder: 'Imagenes/', background: 'Fondos/Paladin Fondo.png' },
  'dungeon-master': { name: 'Dungeon Master', key: 'Maru', root: './', background: 'fondos/wizard fondo.png', dm: true }
};
const characterId = sessionStorage.getItem(sessionKey);
const character = characters[characterId];
const workbookPath = character && character.workbook ? `${character.root}${character.workbook}` : '';
const selectionKey = `wizard-spells-selections-${characterId || 'guest'}`;

const state = { spells: [], query: '', levels: [], imageOnly: false, characters: [], selections: readSelections() };
const elements = {
  grid: document.querySelector('#spell-grid'),
  empty: document.querySelector('#empty-state'),
  count: document.querySelector('#spell-count'),
  status: document.querySelector('#source-status'),
  search: document.querySelector('#search'),
  level: document.querySelector('#level-filter'),
  levelSummary: document.querySelector('#level-summary'),
  characterFilter: document.querySelector('#character-filter'),
  characterSummary: document.querySelector('#character-summary'),
  reload: document.querySelector('#reload')
};

function setupAccess() {
  const loginForm = document.querySelector('#login-form');
  const loginScreen = document.querySelector('#login-screen');
  const logout = document.querySelector('#logout');
  if (character) {
    if (character.dm && view === 'equipped') {
      window.location.replace('index.html');
      return false;
    }
    document.body.classList.add('authenticated');
    document.querySelector('#character-name').textContent = character.name;
    document.body.style.setProperty('--background-image', `url("${character.root}${character.background}")`);
    document.body.classList.toggle('dm-mode', character.dm === true);
    if (character.dm) {
      document.title = 'Wizard Spells | Dungeon Master';
      document.querySelector('.hero h1').textContent = 'Hechizos equipados';
      document.querySelector('.intro').textContent = 'Vista de solo lectura con los hechizos seleccionados por Vaelis y Viko.';
    }
  }
  if (loginForm) loginForm.addEventListener('submit', event => {
    event.preventDefault();
    const selected = document.querySelector('#character-select').value;
    const enteredKey = document.querySelector('#access-key').value;
    if (!characters[selected] || characters[selected].key !== enteredKey) {
      document.querySelector('#login-error').hidden = false;
      return;
    }
    sessionStorage.setItem(sessionKey, selected);
    window.location.href = selected === 'dungeon-master' ? 'index.html' : window.location.href;
  });
  if (logout) logout.addEventListener('click', () => { sessionStorage.removeItem(sessionKey); window.location.href = 'index.html'; });
  return Boolean(character);
}

function readSelections() {
  try { return JSON.parse(localStorage.getItem(selectionKey) || '{}'); } catch (error) { return {}; }
}

function saveSelections() {
  localStorage.setItem(selectionKey, JSON.stringify(state.selections));
}

function selectedFor(spell) {
  if (characterId === 'dungeon-master') return readSelectionsFor(spell.owner)[spell.id] === true;
  return state.selections[spell.id] === true;
}

function readSelectionsFor(ownerId) {
  try { return JSON.parse(localStorage.getItem(`wizard-spells-selections-${ownerId}`) || '{}'); } catch (error) { return {}; }
}

function clean(value) {
  return String(value ?? '').trim();
}

function key(value) {
  return clean(value).toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function imageFor(name, ownerId = characterId) {
  const owner = characters[ownerId];
  const images = ownerId === 'viko' ? {
    aid: 'Aid.png', 'aid ayuda': 'Aid.png',
    bless: 'Bless (Bendecir).png', 'bless bendecir': 'Bless (Bendecir).png',
    ceremony: 'Ceremony.png',
    command: 'Command (Orden).png', 'command orden': 'Command (Orden).png',
    'cure wounds': 'Cure Wounds (Curar Heridas).png', 'cure wounds curar heridas': 'Cure Wounds (Curar Heridas).png',
    'divine sense': 'Divine sense.png',
    'divine smite': 'Divine Smite.png',
    'divine favor': 'Divine favor.png', 'divine favor favor divino': 'Divine favor.png',
    'branding smite': 'branding smite.png', 'branding smite castigo marcador': 'branding smite.png',
    'compelled duel': 'compelled duel.png', 'compelled duel duelo obligado': 'compelled duel.png',
    'detect evil and good': 'detect evil and good.png',
    'detect magic': 'Detect magic.png',
    'detect poison and disease': 'Detect poison and disease.png',
    'enhance ability': 'enhance ability.png',
    'find steed': 'Find Steed.png', 'find steed encontrar corcel': 'Find Steed.png',
    'gentle repose': 'Gentle Repose.png', 'gentle repose reposo gentil': 'Gentle Repose.png',
    'guiding bolt': 'Guiding Bolt.png',
    heroism: 'heroism.png',
    'lay on hands': 'Lay on hands.png',
    'lesser restoration': 'Lesser Restoration.png', 'lesser restoration restauracion menor': 'Lesser Restoration.png',
    'magic weapon': 'Magic weapon.png',
    'prayer of healing': 'Prayer of healing.png',
    'protection from evil and good': 'protection from evile and good.png',
    'protection from poison': 'Protection from Poison.png',
    'purify food and drink': 'Purify Food and Drink.png',
    'searing orb': 'Searing orb.png', 'searing orb orbe abrasador': 'Searing orb.png',
    'searing smite': 'Searing smite.png', 'searing smite castigo ardiente': 'Searing smite.png',
    'shield of faith': 'shield of faith.png', 'shield of faith escudo de fe': 'shield of faith.png',
    'shining smite': 'shining smite.png', 'shining smite castigo luminoso': 'shining smite.png',
    'thunderous smite': 'Thunderous Smite.png', 'thunderous smite castigo atronador': 'Thunderous Smite.png',
    wardaway: 'Wardaway.png',
    'warding bond': 'Warding bond.png',
    'wrathful smite': 'wrathful smite.png', 'wrathful smite castigo colerico': 'wrathful smite.png',
    'zone of truth': 'Zone of truth.png'
  } : {
    'acid splash': 'Acid Splash.png', 'chill touch': 'Chill Touch.png', 'dancing lights': 'Dancing Lights.png',
    elementalism: 'Elementalism.png', 'fire bolt': 'Fire bolt.png', light: 'Light.png', 'mage hand': 'Mage hand.png',
    mending: 'Mending.png', message: 'Message.png', 'true strike': 'true strike.png', sleep: 'sleep.png',
    'silent image': 'silent image.png', 'shocking grasp': 'shocking grasp.png', 'disguise self': 'self disguise.png',
    'ray of frost': 'ray of frost.png', prestidigitation: 'prestidigitation.png', 'poison spray': 'Poison Spray.png',
    'minor illusion': 'Minor Illusion.png', 'mage armor': 'mage armor.png', invisibility: 'invisibility.png',
    'find familiar': 'find familiar.png', 'color spray': 'color spary.png'
  };
  return images[key(name)] && owner.imageFolder ? `${owner.root}${owner.imageFolder}${images[key(name)]}` : '';
}

function normalizeRows(rows, ownerId = characterId) {
  return rows.filter(row => clean(row.HECHIZO)).map(row => ({
    name: clean(row.HECHIZO),
    id: key(row.HECHIZO),
    owner: ownerId,
    equipped: key(row.EQUIPADO) === 'si',
    level: clean(row.NIVEL) || 'Sin nivel',
    description: clean(row.DESCRIPCION) || 'Sin descripción disponible.',
    dice: clean(row.DADOS),
    range: clean(row.ALCANCE),
    concentration: clean(row.CONCENTRACION),
    duration: clean(row['DURACION (1 turno  = 1 MINUTO)']) || clean(row.DURACION),
    image: imageFor(row.HECHIZO, ownerId)
  }));
}

function parseWorkbook(data, ownerId) {
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
  return normalizeRows(rows, ownerId);
}

function loadWorkbook(data, sourceName, ownerId = characterId) {
  state.spells = parseWorkbook(data, ownerId);
  state.spells.forEach(spell => {
    if (typeof state.selections[spell.id] !== 'boolean') state.selections[spell.id] = spell.equipped;
  });
  saveSelections();
  state.query = '';
  elements.search.value = '';
  populateLevels();
  populateCharacters();
  render();
  elements.status.textContent = `${state.spells.length} preparados · ${sourceName}`;
}

async function loadDungeonMaster() {
  const owners = ['vaelis', 'viko'];
  const datasets = await Promise.all(owners.map(async ownerId => {
    const owner = characters[ownerId];
    const response = await fetch(`${owner.root}${owner.workbook}`);
    if (!response.ok) throw new Error(`No se pudo cargar ${owner.name}`);
    return parseWorkbook(await response.arrayBuffer(), ownerId);
  }));
  state.spells = datasets.flat();
  state.query = '';
  elements.search.value = '';
  populateLevels();
  populateCharacters();
  render();
  elements.status.textContent = `${state.spells.filter(selectedFor).length} hechizos seleccionados · Vaelis y Viko`;
}

function populateLevels() {
  const levels = [...new Set(state.spells.map(spell => spell.level))].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));
  state.levels = [];
  state.imageOnly = false;
  elements.level.innerHTML = `<label><input type="checkbox" value="all"> <span>Todos los niveles</span></label><label class="image-filter"><input type="checkbox" value="image"> <span>Con imagen</span></label>` + levels.map(level => `<label><input type="checkbox" value="${escapeHtml(level)}"> <span>${escapeHtml(level)}</span></label>`).join('');
  updateLevelSummary();
}

function populateCharacters() {
  if (!elements.characterFilter) return;
  state.characters = [...new Set(state.spells.map(spell => spell.owner))];
  elements.characterFilter.innerHTML = '<label><input type="checkbox" value="all"> <span>Todos</span></label>' + state.characters.map(ownerId => `<label><input type="checkbox" value="${ownerId}"> <span>${escapeHtml(characters[ownerId].name)}</span></label>`).join('');
  updateCharacterSummary();
}

function updateCharacterSummary() {
  if (!elements.characterSummary) return;
  elements.characterSummary.textContent = state.characters.length && state.characters.length !== 2 ? `Personajes: ${state.characters.map(ownerId => characters[ownerId].name).join(', ')}` : 'Personajes: Todos';
}

function updateLevelSummary() {
  if (!elements.levelSummary) return;
  const filters = [...state.levels];
  if (state.imageOnly) filters.push('Con imagen');
  elements.levelSummary.textContent = filters.length ? `Filtro: ${filters.join(', ')}` : 'Nivel: Todos';
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function filteredSpells() {
  const query = key(state.query);
  return state.spells.filter(spell => {
    const belongsToSelectedCharacter = characterId !== 'dungeon-master' || !state.characters.length || state.characters.includes(spell.owner);
    const isVisible = characterId === 'dungeon-master' ? selectedFor(spell) : (view !== 'equipped' || selectedFor(spell));
    return belongsToSelectedCharacter && isVisible && (!query || key(`${spell.name} ${spell.description}`).includes(query)) && (!state.levels.length || state.levels.includes(spell.level)) && (!state.imageOnly || spell.image);
  });
}

function render() {
  const spells = filteredSpells();
  elements.count.textContent = spells.length;
  const equippedCount = state.spells.filter(selectedFor).length;
  const navCount = document.querySelector('#nav-equipped-count');
  if (navCount) navCount.textContent = equippedCount;
  elements.grid.innerHTML = spells.map(spell => `<article class="spell-card">
    <div class="card-art ${spell.image ? '' : 'no-art'}">${spell.image ? `<img src="${spell.image}" alt="" loading="lazy">` : '<span>✦</span>'}<b>${escapeHtml(spell.level)}</b></div>
    <div class="card-content">
      <h2>${escapeHtml(spell.name)}</h2>
      <p>${escapeHtml(spell.description)}</p>
      <dl class="details">
        ${spell.range ? `<div><dt>Alcance</dt><dd>${escapeHtml(spell.range)}</dd></div>` : ''}
        ${spell.duration ? `<div><dt>Duración</dt><dd>${escapeHtml(spell.duration)}</dd></div>` : ''}
        ${spell.dice ? `<div><dt>Efecto</dt><dd>${escapeHtml(spell.dice)}</dd></div>` : ''}
      </dl>
      <div class="card-footer"><div class="tags">${characterId === 'dungeon-master' ? `<span class="owner-tag">${escapeHtml(characters[spell.owner].name)}</span>` : ''}${spell.concentration && key(spell.concentration) !== 'no' ? '<span>Concentración</span>' : ''}</div>${view === 'inventory' && characterId !== 'dungeon-master' ? `<div class="choice" role="group" aria-label="Seleccionar ${escapeHtml(spell.name)}"><button class="choice-button yes ${selectedFor(spell) ? 'selected' : ''}" data-spell-id="${escapeHtml(spell.id)}" data-choice="yes" type="button">Sí</button><button class="choice-button no ${!selectedFor(spell) ? 'selected' : ''}" data-spell-id="${escapeHtml(spell.id)}" data-choice="no" type="button">No</button></div>` : ''}</div>
    </div>
  </article>`).join('');
  elements.empty.hidden = spells.length > 0;
}

async function loadDefaultWorkbook() {
  elements.status.textContent = 'Cargando grimorio...';
  try {
    const response = await fetch(workbookPath);
    if (!response.ok) throw new Error('No se pudo encontrar el archivo');
    loadWorkbook(await response.arrayBuffer(), workbookPath);
  } catch (error) {
    elements.status.textContent = 'Elige Wizard Spells.xlsx para comenzar';
    elements.empty.hidden = false;
  }
}

if (setupAccess()) {
elements.search.addEventListener('input', event => { state.query = event.target.value; render(); });
elements.level.addEventListener('change', event => {
  const checkbox = event.target.closest('input[type="checkbox"]');
  if (!checkbox) return;
  const checkboxes = [...elements.level.querySelectorAll('input[type="checkbox"]')];
  if (checkbox.value === 'all' && checkbox.checked) checkboxes.filter(item => item !== checkbox).forEach(item => { item.checked = false; });
  if (checkbox.value !== 'all' && checkbox.checked) checkboxes.find(item => item.value === 'all').checked = false;
  state.imageOnly = Boolean(checkboxes.find(item => item.value === 'image')?.checked);
  state.levels = checkboxes.filter(item => item.checked && item.value !== 'all').map(item => item.value);
  state.levels = state.levels.filter(level => level !== 'image');
  updateLevelSummary();
  render();
});
elements.characterFilter.addEventListener('change', event => {
  const checkbox = event.target.closest('input[type="checkbox"]');
  if (!checkbox) return;
  const checkboxes = [...elements.characterFilter.querySelectorAll('input[type="checkbox"]')];
  if (checkbox.value === 'all' && checkbox.checked) checkboxes.filter(item => item !== checkbox).forEach(item => { item.checked = false; });
  if (checkbox.value !== 'all' && checkbox.checked) checkboxes.find(item => item.value === 'all').checked = false;
  state.characters = checkboxes.filter(item => item.checked && item.value !== 'all').map(item => item.value);
  updateCharacterSummary();
  render();
});
elements.reload.addEventListener('click', loadDefaultWorkbook);
elements.grid.addEventListener('click', event => {
  const button = event.target.closest('[data-spell-id]');
  if (!button) return;
  state.selections[button.dataset.spellId] = button.dataset.choice === 'yes';
  saveSelections();
  render();
});

if (characterId === 'dungeon-master') {
  loadDungeonMaster().catch(() => { elements.status.textContent = 'No se pudieron cargar los grimorios'; elements.empty.hidden = false; });
} else {
  loadDefaultWorkbook();
}
}