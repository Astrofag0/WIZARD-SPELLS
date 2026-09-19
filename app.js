const workbookPath = 'Wizard Spells.xlsx';
const imageFolder = 'imagenes/';
const selectionKey = 'wizard-spells-selections';
const view = document.body.dataset.view || 'inventory';

const state = { spells: [], query: '', levels: [], imageOnly: false, selections: readSelections() };
const elements = {
  grid: document.querySelector('#spell-grid'),
  empty: document.querySelector('#empty-state'),
  count: document.querySelector('#spell-count'),
  status: document.querySelector('#source-status'),
  search: document.querySelector('#search'),
  level: document.querySelector('#level-filter'),
  levelSummary: document.querySelector('#level-summary'),
  file: document.querySelector('#file-input'),
  reload: document.querySelector('#reload')
};

function readSelections() {
  try { return JSON.parse(localStorage.getItem(selectionKey) || '{}'); } catch (error) { return {}; }
}

function saveSelections() {
  localStorage.setItem(selectionKey, JSON.stringify(state.selections));
}

function clean(value) {
  return String(value ?? '').trim();
}

function key(value) {
  return clean(value).toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function imageFor(name) {
  const images = {
    'acid splash': 'Acid Splash.png',
    'chill touch': 'Chill Touch.png',
    'dancing lights': 'Dancing Lights.png',
    'elementalism': 'Elementalism.png',
    'fire bolt': 'Fire bolt.png',
    'light': 'Light.png',
    'mage hand': 'Mage hand.png',
    'mending': 'Mending.png',
    'message': 'Message.png',
    'true strike': 'true strike.png',
    'sleep': 'sleep.png',
    'silent image': 'silent image.png',
    'shocking grasp': 'shocking grasp.png',
    'disguise self': 'self disguise.png',
    'ray of frost': 'ray of frost.png',
    'prestidigitation': 'prestidigitation.png',
    'poison spray': 'Poison Spray.png',
    'minor illusion': 'Minor Illusion.png',
    'mage armor': 'mage armor.png',
    'invisibility': 'invisibility.png',
    'find familiar': 'find familiar.png',
    'color spray': 'color spary.png'
  };
  return images[key(name)] ? imageFolder + images[key(name)] : '';
}

function normalizeRows(rows) {
  return rows.filter(row => clean(row.HECHIZO)).map(row => ({
    name: clean(row.HECHIZO),
    id: key(row.HECHIZO),
    equipped: key(row.EQUIPADO) === 'si',
    level: clean(row.NIVEL) || 'Sin nivel',
    description: clean(row.DESCRIPCION) || 'Sin descripción disponible.',
    dice: clean(row.DADOS),
    range: clean(row.ALCANCE),
    concentration: clean(row.CONCENTRACION),
    duration: clean(row['DURACION (1 turno  = 1 MINUTO)']) || clean(row.DURACION),
    image: imageFor(row.HECHIZO)
  }));
}

function loadWorkbook(data, sourceName) {
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
  state.spells = normalizeRows(rows);
  state.spells.forEach(spell => {
    if (typeof state.selections[spell.id] !== 'boolean') state.selections[spell.id] = spell.equipped;
  });
  saveSelections();
  state.query = '';
  elements.search.value = '';
  populateLevels();
  render();
  elements.status.textContent = `${state.spells.length} preparados · ${sourceName}`;
}

function populateLevels() {
  const levels = [...new Set(state.spells.map(spell => spell.level))].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));
  state.levels = [];
  state.imageOnly = false;
  elements.level.innerHTML = `<label><input type="checkbox" value="all"> <span>Todos los niveles</span></label><label class="image-filter"><input type="checkbox" value="image"> <span>Con imagen</span></label>` + levels.map(level => `<label><input type="checkbox" value="${escapeHtml(level)}"> <span>${escapeHtml(level)}</span></label>`).join('');
  updateLevelSummary();
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
  return state.spells.filter(spell => (view !== 'equipped' || state.selections[spell.id]) && (!query || key(`${spell.name} ${spell.description}`).includes(query)) && (!state.levels.length || state.levels.includes(spell.level)) && (!state.imageOnly || spell.image));
}

function render() {
  const spells = filteredSpells();
  elements.count.textContent = spells.length;
  const equippedCount = state.spells.filter(spell => state.selections[spell.id]).length;
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
      <div class="card-footer"><div class="tags">${spell.concentration && key(spell.concentration) !== 'no' ? '<span>Concentración</span>' : ''}</div>${view === 'inventory' ? `<div class="choice" role="group" aria-label="Seleccionar ${escapeHtml(spell.name)}"><button class="choice-button yes ${state.selections[spell.id] ? 'selected' : ''}" data-spell-id="${escapeHtml(spell.id)}" data-choice="yes" type="button">Sí</button><button class="choice-button no ${!state.selections[spell.id] ? 'selected' : ''}" data-spell-id="${escapeHtml(spell.id)}" data-choice="no" type="button">No</button></div>` : ''}</div>
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
elements.reload.addEventListener('click', loadDefaultWorkbook);
elements.file.addEventListener('change', async event => {
  const [file] = event.target.files;
  if (file) loadWorkbook(await file.arrayBuffer(), file.name);
});
elements.grid.addEventListener('click', event => {
  const button = event.target.closest('[data-spell-id]');
  if (!button) return;
  state.selections[button.dataset.spellId] = button.dataset.choice === 'yes';
  saveSelections();
  render();
});

loadDefaultWorkbook();