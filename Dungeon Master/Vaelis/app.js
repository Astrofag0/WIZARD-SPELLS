const sessionKey = 'wizard-spells-character';
const view = document.body.dataset.view || 'inventory';
const characters = {
  frederick: { name: 'Frederick D´Rosectta', key: 'rosas', root: '../Frederick D’Rosectta/', workbook: 'Frederick D´Rosectta.xlsx', imageFolder: 'Imagenes Vampire/', background: 'Fondos Vampire/f8573825-9552-4a6f-8fc9-94c41eec4b08.png' },
  jeanne: { name: 'Jeanne Di Arc', key: 'artesana', root: '../Jeanne Di Arc/', workbook: 'Conjuros Clerigo Remastered.xlsx', imageFolder: 'Imagenes Ghost/', background: 'Ghost Fondos/4a8d96a8-30e1-43ac-ba45-2fd9981ca049.png' },
  luxxxi: { name: 'Luxxxi Fernando', key: 'tiflin', root: '../Luxxxi Fernando/', workbook: 'Luxxxi Fernando.xlsx', imageFolder: 'Imagenes Tiflin/', background: 'Tiflin Fondos/9bfd9361-157d-4dd6-8c7c-7f38090f3b49.png' },
  minerva: { name: 'Minerva Di Coleoptera', key: 'polvito', root: '../Minerva Di Coleoptera/', workbook: 'Minerva Di Coleoptera.xlsx', imageFolder: 'Imagenes/', background: 'Fondos Bardo/2b99b6cb-9821-476e-8c0d-3d3693816ec5.png' },
  viko: { name: 'Viko', key: 'paladin', root: '../Viko/', workbook: 'Paladin Spells.xlsx', imageFolder: 'Imagenes/', background: 'Fondos/Paladin Fondo.png' },
  vaelis: { name: 'Vaelis', key: 'Miaw', root: './', workbook: 'Wizard Spells.xlsx', imageFolder: 'imagenes/', background: 'fondos/wizard fondo.png' },
  'dungeon-master': { name: 'Dungeon Master', key: 'Maru', root: '../', dm: true, background: 'Fondos DM/God Fondo.png' }
};
const characterId = sessionStorage.getItem(sessionKey);
const character = characters[characterId];
const selectionKey = `wizard-spells-selections-${characterId || 'guest'}`;
const state = { spells: [], activeOwner: sessionStorage.getItem('wizard-spells-active-owner') || 'vaelis', ownerFilters: [], query: '', levels: [], imageOnly: false, selections: readJson(selectionKey), stars: readJson('wizard-spells-stars') };
const elements = {
  grid: document.querySelector('#spell-grid'), empty: document.querySelector('#empty-state'), count: document.querySelector('#spell-count'), status: document.querySelector('#source-status'), search: document.querySelector('#search'), level: document.querySelector('#level-filter'), levelSummary: document.querySelector('#level-summary'), characterFilter: document.querySelector('#character-filter'), characterSummary: document.querySelector('#character-summary'), reload: document.querySelector('#reload'), tabs: document.querySelector('#dm-tabs'), resetStars: document.querySelector('#reset-stars')
};
const imageFiles = {
  vaelis: ['Acid Splash.png', 'Chill Touch.png', 'Dancing Lights.png', 'Elementalism.png', 'Fire bolt.png', 'Light.png', 'Mage hand.png', 'Mending.png', 'Message.png', 'Minor Illusion.png', 'Poison Spray.png', 'color spary.png', 'find familiar.png', 'invisibility.png', 'mage armor.png', 'prestidigitation.png', 'ray of frost.png', 'self disguise.png', 'shocking grasp.png', 'silent image.png', 'sleep.png', 'true strike.png'],
  viko: ['Aid.png', 'Bless (Bendecir).png', 'branding smite.png', 'Ceremony.png', 'Command (Orden).png', 'compelled duel.png', 'Cure Wounds (Curar Heridas).png', 'detect evil and good.png', 'Detect magic.png', 'Detect poison and disease.png', 'Divine favor.png', 'Divine sense.png', 'Divine Smite.png', 'enhance ability.png', 'Find Steed.png', 'Gentle Repose.png', 'Guiding Bolt.png', 'heroism.png', 'Lay on hands.png', 'Lesser Restoration.png', 'Locate Object.png', 'Magic weapon.png', 'Prayer of healing.png', 'protection from evile and good.png', 'Protection from Poison.png', 'Purify Food and Drink.png', 'Searing orb.png', 'Searing smite.png', 'shield of faith.png', 'shining smite.png', 'Thunderous Smite.png', 'Wardaway.png', 'Warding bond.png', 'wrathful smite.png', 'Zone of truth.png'],
  frederick: ['Absorb Elements.png', 'Burning Hands.png', 'Charm Person.png', 'Darkness.png', 'Fire Bolt.png', 'Fireball.png', 'Mage Hand.png', 'Misty Step.png', 'Prestidigitation.png', 'Scorching Ray.png', 'Shield.png', 'Vampire Bite.png', 'Vampire Touch.png'],
  jeanne: ['Aid (Ayuda).png', 'Animate Dead (Animar a los muertos).png', 'Bane (Perdicion).png', 'Bestow Curse (Imponer maldición).png', 'Bless (Bendencir).png', 'Blindness-Deafness (Ceguera-Sordera).png', 'Calm Emotions (Calmar emociones).png', 'Clairvoyance (Clarividencia).png', 'Create Food and Water (Crear comida y agua).png', 'Cure Wounds (Curar Heridas).png', 'Daylight (Luz de Dia).png', 'Dispel Magic (Disipar magia).png', 'Feign Death (Simular muerte).png', 'Glyph of Warding (Glifo de custodia).png', 'Guidance (Guia).png', 'Guiding Bolt (Rayo radiante).png', 'Healing Word (Palabra Curativa).png', 'Hold Person (Inmovilizar persona).png', 'Inflict Wounds (Infligir heridas).png', 'Lesser Restoration (Restauración menor).png', 'Light (Luz).png', 'Light (Luz de Dia).png', 'Mass Healing Word (Palabra de curación en masa).png', 'Prayer of Healing (Oración de sanación).png', 'Protection from Energy (Protección contra la energía).png', 'Remove Curse (Remover Maldicion).png', 'Revivify (Revivificar).png', 'Sacred Flame (Llama Sagrada).png', 'Sanctuary (Santuario).png', 'See Invisibility (Ver lo invisble).png', 'Sending (Envio-Mensaje).png', 'Shield of Faith (Escudo de Fe).png', 'Silence (Silencio).png', 'Spare the Dying (Perdonar a los moribundos).png', 'Spirit Guardians (Guardianes espirituales).png', 'Spiritual Weapon (Arma espiritual).png', 'Thaumaturgy (Taumaturgia).png', 'Toll the Dead (Tañido de la muerte).png', 'Tongues (Lenguas- Idiomas).png', 'Virtue (Virtud).png'],
  minerva: ['Burla Viciosa.png', 'Detectar Magia.png', 'Disguise Self.png', 'Encantar Persona.png', 'Enemies Abound.png', 'Garras de Mantis.png', 'Imagen Mayor.png', 'Inspiracion Bardica.png', 'Mordida de Mantis.png', 'Palabra Sanadora.png', 'Patron Hipnotico.png', 'Sugerencia - Suggestion.png', 'Susurros Disonantes.png']
};
function readJson(name) { try { return JSON.parse(localStorage.getItem(name) || '{}'); } catch { return {}; } }
function clean(value) { return String(value ?? '').trim(); }
function key(value) { return clean(value).toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])); }
function saveSelections() { localStorage.setItem(selectionKey, JSON.stringify(state.selections)); }
function selectionId(spell) { return `${spell.owner}:${spell.id}`; }
function approvedByDungeonMaster(spell) { return readJson('wizard-spells-selections-dungeon-master')[selectionId(spell)] === true; }
function selectedByUser(spell) { return readJson(`wizard-spells-selections-${spell.owner}`)[selectionId(spell)] === true; }
function englishTitle(value) {
  const text = clean(value).replace(/\.png$/i, '').trim();
  if (!text) return '';
  const withoutParentheses = text.split('(')[0].trim();
  const candidate = withoutParentheses || text;
  return key(candidate).replace(/\s+/g, ' ').trim();
}
function titleParts(value) {
  const text = clean(value).replace(/\.png$/i, '');
  const english = englishTitle(text);
  const parts = [text, english, text.split('(')[0], ...(text.match(/\(([^)]+)\)/g) || []).map(part => part.slice(1, -1))];
  return parts.map(part => key(part)).filter(Boolean);
}
function imageFor(name, ownerId) {
  const owner = characters[ownerId];
  const englishName = englishTitle(name);
  const files = imageFiles[ownerId] || [];
  const file = files.find(item => {
    const englishItem = englishTitle(item);
    if (!englishName || !englishItem) return false;
    const exactMatch = englishName === englishItem;
    const containsMatch = englishName.includes(englishItem) || englishItem.includes(englishName);
    const fuzzyMatch = titleParts(name).some(namePart => titleParts(item).some(itemPart => {
      if (namePart === itemPart) return true;
      return namePart.startsWith(itemPart) || itemPart.startsWith(namePart);
    }));
    return exactMatch || containsMatch || fuzzyMatch;
  });
  return file ? `${owner.root}${owner.imageFolder}${file}` : '';
}
function pickValue(row, keys) {
  if (!row) return '';
  const normalized = {};
  Object.entries(row).forEach(([keyName, value]) => {
    if (value === undefined || value === null) return;
    const norm = String(keyName).toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    normalized[norm] = value;
  });
  for (const keyName of keys) {
    const normalizedKey = String(keyName).toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    if (normalized[normalizedKey] !== undefined) return clean(normalized[normalizedKey]);
  }
  return '';
}
function normalizeRows(rows, ownerId) {
  return rows.filter(row => {
    const name = pickValue(row, ['HECHIZO', 'Nombre del conjuro', 'Nombre del hechizo', 'Nombre', 'name', 'Spell Name']);
    return clean(name);
  }).map(row => {
    const name = pickValue(row, ['HECHIZO', 'Nombre del conjuro', 'Nombre del hechizo', 'Nombre', 'name', 'Spell Name']);
    const description = pickValue(row, ['DESCRIPCION', 'Descripción', 'description', 'descripcion', 'descripcion del conjuro', 'descripcion del hechizo']);
    const level = pickValue(row, ['NIVEL', 'Nivel', 'nivel', 'nivel del conjuro', 'Nivel PJ']);
    const dice = pickValue(row, ['DADOS', 'TIRADA', 'Tipo de tirada', 'TIRADA (CD Y COMO IMPACTA)', 'Tipo tirada', 'tipo de tirada', 'Type of roll']);
    const range = pickValue(row, ['ALCANCE', 'CD mínima / Cómo impacta', 'CD minima / Como impacta', 'alcance del conjuro', 'Range']);
    const concentration = pickValue(row, ['CONCENTRACION', 'Concentración', 'concentracion', 'Concentration']);
    const duration = pickValue(row, ['DURACION (1 turno  = 1 MINUTO)', 'DURACION (1 turno = 1 MINUTO)', 'Duración', 'duracion', 'Duration']);
    return { owner: ownerId, id: key(name), name, level: level || 'Sin nivel', description: description || 'Sin descripción disponible.', dice, range, concentration, duration, image: imageFor(name, ownerId) };
  });
}
function parseWorkbook(data, ownerId) {
  const book = XLSX.read(data, { type: 'array' });
  const rows = book.SheetNames.flatMap(sheetName => XLSX.utils.sheet_to_json(book.Sheets[sheetName], { defval: '' }));
  return normalizeRows(rows, ownerId);
}
function setupAccess() {
  const form = document.querySelector('#login-form');
  if (character) { document.body.classList.add('authenticated'); document.querySelector('#character-name').textContent = character.name; document.body.style.setProperty('--background-image', `url("${character.root}${character.background}")`); document.body.classList.toggle('dm-mode', characterId === 'dungeon-master'); document.body.classList.toggle('equipped-mode', view === 'equipped'); document.body.classList.toggle('image-zoom', characterId === 'vaelis' || characterId === 'viko'); if (!character.dm && view === 'slots') { window.location.replace('index.html'); return false; } }
  form?.addEventListener('submit', event => { event.preventDefault(); const id = document.querySelector('#character-select').value; const pass = document.querySelector('#access-key').value; if (!characters[id] || characters[id].key !== pass) { document.querySelector('#login-error').hidden = false; return; } sessionStorage.setItem(sessionKey, id); window.location.href = 'index.html'; });
  document.querySelector('#logout')?.addEventListener('click', () => { sessionStorage.removeItem(sessionKey); window.location.href = 'index.html'; });
  return Boolean(character);
}
async function load() {
  const owners = characterId === 'dungeon-master' ? Object.keys(characters).filter(id => id !== 'dungeon-master') : [characterId];
  const sets = await Promise.all(owners.map(async ownerId => { const owner = characters[ownerId]; const response = await fetch(`${owner.root}${owner.workbook}`); if (!response.ok) throw new Error(owner.name); return parseWorkbook(await response.arrayBuffer(), ownerId); }));
  state.spells = sets.flat();
  if (characterId !== 'dungeon-master') { state.spells.forEach(spell => { const id = selectionId(spell); if (!(id in state.selections)) state.selections[id] = false; }); saveSelections(); }
  if (elements.level) populateLevels();
  populateCharacterFilter();
  renderTabs();
  if (view !== 'slots') render();
  elements.status.textContent = view === 'slots' ? 'Ranuras listas para configurar' : `${filteredSpells().length} hechizos visibles`;
}
function populateCharacterFilter() {
  if (!elements.characterFilter || characterId !== 'dungeon-master') return;
  const owners = Object.keys(characters).filter(id => id !== 'dungeon-master');
  state.ownerFilters = [];
  elements.characterFilter.innerHTML = `<label><input type="checkbox" value="all"> <span>Todos</span></label>${owners.map(id => `<label><input type="checkbox" value="${id}"> <span>${escapeHtml(characters[id].name)}</span></label>`).join('')}`;
  updateCharacterSummary();
}
function updateCharacterSummary() {
  if (!elements.characterSummary) return;
  elements.characterSummary.textContent = state.ownerFilters.length ? `Personajes: ${state.ownerFilters.map(id => characters[id].name).join(', ')}` : 'Personajes: Todos';
}
function renderTabs() {
  if (!elements.tabs) return;
  elements.tabs.innerHTML = '';
  if (characterId !== 'dungeon-master') return;
  Object.keys(characters).filter(id => id !== 'dungeon-master').forEach(id => { const tab = document.createElement('button'); tab.className = `dm-tab ${state.activeOwner === id && view !== 'equipped' ? 'active' : ''}`; tab.textContent = characters[id].name; tab.onclick = () => { sessionStorage.setItem('wizard-spells-active-owner', id); if (view === 'equipped') window.location.href = 'index.html'; else { state.activeOwner = id; renderTabs(); render(); } }; elements.tabs.appendChild(tab); });
  const equipped = document.createElement('button'); equipped.className = `dm-tab ${view === 'equipped' ? 'active' : ''}`; equipped.textContent = 'Hechizos equipados'; equipped.onclick = () => { window.location.href = 'grimorio equipado.html'; }; elements.tabs.appendChild(equipped);
  const slots = document.createElement('button'); slots.className = `dm-tab ${view === 'slots' ? 'active' : ''}`; slots.textContent = 'Ranuras Hechizo'; slots.onclick = () => { window.location.href = 'ranuras hechizo.html'; }; elements.tabs.appendChild(slots);
}
function filteredSpells() { const query = key(state.query); return state.spells.filter(spell => { const ownerVisible = characterId === 'dungeon-master' ? (view === 'equipped' ? (!state.ownerFilters.length || state.ownerFilters.includes(spell.owner)) : spell.owner === state.activeOwner) : true; const selectedVisible = characterId === 'dungeon-master' ? (view !== 'equipped' || selectedByUser(spell)) : (view !== 'equipped' ? approvedByDungeonMaster(spell) : selectedByUser(spell)); return ownerVisible && selectedVisible && (!query || key(`${spell.name} ${spell.description}`).includes(query)) && (!state.levels.length || state.levels.includes(spell.level)) && (!state.imageOnly || spell.image); }); }
function populateLevels() { const levels = [...new Set(state.spells.map(s => s.level))].sort((a, b) => a.localeCompare(b, 'es', { numeric: true })); elements.level.innerHTML = `<label><input type="checkbox" value="all"> <span>Todos los niveles</span></label><label class="image-filter"><input type="checkbox" value="image"> <span>Con imagen</span></label>${levels.map(level => `<label><input type="checkbox" value="${escapeHtml(level)}"> <span>${escapeHtml(level)}</span></label>`).join('')}`; }
function starsFor(spell) { const max = key(spell.level) === '1' ? 4 : 3; const value = state.stars[`${spell.owner}:${spell.id}`] || 0; return `<div class="stars">${Array.from({ length: max }, (_, i) => `<button type="button" class="star ${i < value ? 'lit' : ''}" data-star-owner="${spell.owner}" data-star-id="${escapeHtml(spell.id)}" data-star-value="${i + 1}">★</button>`).join('')}</div>`; }
function render() { const spells = filteredSpells(); const currentSelections = state.spells.filter(selectedByUser).length; const countLink = document.querySelector('#nav-equipped-count'); if (countLink) countLink.textContent = currentSelections; elements.count.textContent = spells.length; elements.grid.innerHTML = spells.map(spell => { const choice = characterId === 'dungeon-master' ? approvedByDungeonMaster(spell) : selectedByUser(spell); const hasDescription = Boolean(spell.description && spell.description !== 'Sin descripción disponible.'); const descriptionMarkup = hasDescription ? `<p>${escapeHtml(spell.description)}</p><dl class="details">${spell.range ? `<div><dt>Alcance</dt><dd>${escapeHtml(spell.range)}</dd></div>` : ''}${spell.duration ? `<div><dt>Duración</dt><dd>${escapeHtml(spell.duration)}</dd></div>` : ''}${spell.dice ? `<div><dt>Efecto</dt><dd>${escapeHtml(spell.dice)}</dd></div>` : ''}</dl>` : '<p class="image-source-note">Información incluida en la imagen</p>'; return `<article class="spell-card"><div class="card-art ${spell.image ? '' : 'no-art'}">${spell.image ? `<img src="${spell.image}" alt="" loading="lazy">` : '<span>✦</span>'}<b>${escapeHtml(spell.level)}</b></div><div class="card-content"><h2>${escapeHtml(spell.name)}</h2>${descriptionMarkup}<div class="card-footer"><div class="tags">${characterId === 'dungeon-master' ? `<span class="owner-tag">${escapeHtml(characters[spell.owner].name)}</span>` : ''}</div>${view !== 'equipped' ? `<div class="choice"><button class="choice-button yes ${choice ? 'selected' : ''}" data-spell-owner="${spell.owner}" data-spell-id="${escapeHtml(spell.id)}" data-choice="yes">Sí</button><button class="choice-button no ${!choice ? 'selected' : ''}" data-spell-owner="${spell.owner}" data-spell-id="${escapeHtml(spell.id)}" data-choice="no">No</button></div>` : ''}</div></div></article>`; }).join(''); elements.empty.hidden = spells.length > 0; }
function renderSlots() { const owners = Object.keys(characters).filter(id => id !== 'dungeon-master'); elements.grid.innerHTML = owners.map(ownerId => `<section class="slot-panel"><h2>${escapeHtml(characters[ownerId].name)}</h2><div class="slot-levels">${['4', '3', '2', '1'].map(level => { const count = level === '1' ? 4 : 3; const value = state.stars[`${ownerId}:${level}`] || 0; return `<div class="slot-row"><strong>Nivel ${level}</strong><div class="slot-stars">${Array.from({ length: count }, (_, index) => `<button type="button" class="star ${index < value ? 'lit' : ''}" data-slot-owner="${ownerId}" data-slot-level="${level}" data-slot-value="${index + 1}">★</button>`).join('')}</div></div>`; }).join('')}</div></section>`).join(''); elements.empty.hidden = true; }
if (setupAccess()) {
  elements.search?.addEventListener('input', event => { state.query = event.target.value; render(); });
  elements.level?.addEventListener('change', event => { const input = event.target.closest('input'); if (!input) return; const all = [...elements.level.querySelectorAll('input')]; if (input.value === 'all' && input.checked) all.filter(i => i !== input).forEach(i => { i.checked = false; }); if (input.value !== 'all' && input.checked) all.find(i => i.value === 'all').checked = false; state.imageOnly = Boolean(all.find(i => i.value === 'image')?.checked); state.levels = all.filter(i => i.checked && i.value !== 'all' && i.value !== 'image').map(i => i.value); render(); });
  elements.characterFilter?.addEventListener('change', event => { const input = event.target.closest('input'); if (!input) return; const all = [...elements.characterFilter.querySelectorAll('input')]; if (input.value === 'all' && input.checked) all.filter(item => item !== input).forEach(item => { item.checked = false; }); if (input.value !== 'all' && input.checked) all.find(item => item.value === 'all').checked = false; state.ownerFilters = all.filter(item => item.checked && item.value !== 'all').map(item => item.value); updateCharacterSummary(); render(); });
  elements.reload?.addEventListener('click', load);
  elements.resetStars?.addEventListener('click', () => { state.stars = {}; localStorage.setItem('wizard-spells-stars', '{}'); if (view === 'slots') renderSlots(); else render(); });
  elements.grid?.addEventListener('click', event => { const choice = event.target.closest('[data-spell-owner]'); if (choice) { state.selections[`${choice.dataset.spellOwner}:${choice.dataset.spellId}`] = choice.dataset.choice === 'yes'; saveSelections(); render(); return; } const slot = event.target.closest('[data-slot-value]'); if (slot) { state.stars[`${slot.dataset.slotOwner}:${slot.dataset.slotLevel}`] = Number(slot.dataset.slotValue); localStorage.setItem('wizard-spells-stars', JSON.stringify(state.stars)); renderSlots(); } });
  load().then(() => { if (view === 'slots') renderSlots(); }).catch(() => { elements.status.textContent = 'No se pudieron cargar los datos'; elements.empty.hidden = false; });
}
