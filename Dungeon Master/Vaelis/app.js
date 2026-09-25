const sessionKey = 'wizard-spells-character';
const supabaseUrl = 'https://jzglyqrwzbtkllfxkeyw.supabase.co';
const supabaseKey = 'sb_publishable_iqYHWb-RYmbMvVHpiarnfg_oNXCk0q3';
const supabaseHeaders = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' };
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
const state = { spells: [], spellCache: {}, activeOwner: sessionStorage.getItem('wizard-spells-active-owner') || 'vaelis', ownerFilters: [], query: '', levels: [], types: [], imageOnly: false, selections: readJson(selectionKey), stars: readJson('wizard-spells-stars'), customSpells: [], characterLevels: {}, levelsEditor: { characterId: '', px: '', stars: {} } };
const elements = {
  grid: document.querySelector('#spell-grid'), empty: document.querySelector('#empty-state'), count: document.querySelector('#spell-count'), status: document.querySelector('#source-status'), search: document.querySelector('#search'), level: document.querySelector('#level-filter'), levelSummary: document.querySelector('#level-summary'), characterFilter: document.querySelector('#character-filter'), characterSummary: document.querySelector('#character-summary'), reload: document.querySelector('#reload'), tabs: document.querySelector('#dm-tabs'), resetStars: document.querySelector('#reset-stars'), type: document.querySelector('#type-filter'), typeSummary: document.querySelector('#type-summary'), banner: document.querySelector('#level-banner')
};
const imageFiles = {
  vaelis: ['Acid Splash.png', 'Chill Touch.png', 'Dancing Lights.png', 'Elementalism.png', 'Fire bolt.png', 'Light.png', 'Mage hand.png', 'Mending.png', 'Message.png', 'Minor Illusion.png', 'Poison Spray.png', 'color spary.png', 'find familiar.png', 'invisibility.png', 'mage armor.png', 'prestidigitation.png', 'ray of frost.png', 'self disguise.png', 'shocking grasp.png', 'silent image.png', 'sleep.png', 'true strike.png'],
  viko: ['Aid.png', 'Bless (Bendecir).png', 'branding smite.png', 'Ceremony.png', 'Command (Orden).png', 'compelled duel.png', 'Cure Wounds (Curar Heridas).png', 'detect evil and good.png', 'Detect magic.png', 'Detect poison and disease.png', 'Divine favor.png', 'Divine sense.png', 'Divine Smite.png', 'enhance ability.png', 'Find Steed.png', 'Gentle Repose.png', 'Guiding Bolt.png', 'heroism.png', 'Lay on hands.png', 'Lesser Restoration.png', 'Locate Object.png', 'Magic weapon.png', 'Prayer of healing.png', 'protection from evile and good.png', 'Protection from Poison.png', 'Purify Food and Drink.png', 'Searing orb.png', 'Searing smite.png', 'shield of faith.png', 'shining smite.png', 'Thunderous Smite.png', 'Wardaway.png', 'Warding bond.png', 'wrathful smite.png', 'Zone of truth.png'],
  frederick: ['Absorb Elements.png', 'Burning Hands.png', 'Charm Person.png', 'Darkness.png', 'Fire Bolt.png', 'Fireball.png', 'Mage Hand.png', 'Misty Step.png', 'Prestidigitation.png', 'Scorching Ray.png', 'Shield.png', 'Vampiric Bite.png', 'Vampiric Touch.png'],
  jeanne: ['Aid (Ayuda).png', 'Animate Dead (Animar a los muertos).png', 'Bane (Perdicion).png', 'Bestow Curse (Imponer maldición).png', 'Bless (Bendencir).png', 'Blindness-Deafness (Ceguera-Sordera).png', 'Calm Emotions (Calmar emociones).png', 'Clairvoyance (Clarividencia).png', 'Create Food and Water (Crear comida y agua).png', 'Cure Wounds (Curar Heridas).png', 'Daylight (Luz de Dia).png', 'Dispel Magic (Disipar magia).png', 'Feign Death (Simular muerte).png', 'Glyph of Warding (Glifo de custodia).png', 'Guidance (Guia).png', 'Guiding Bolt (Rayo radiante).png', 'Healing Word (Palabra Curativa).png', 'Hold Person (Inmovilizar persona).png', 'Inflict Wounds (Infligir heridas).png', 'Lesser Restoration (Restauración menor).png', 'Light (Luz).png', 'Mass Healing Word (Palabra de curación en masa).png', 'Prayer of Healing (Oración de sanación).png', 'Protection from Energy (Protección contra la energía).png', 'Remove Curse (Remover Maldicion).png', 'Revivify (Revivificar).png', 'Sacred Flame (Llama Sagrada).png', 'Sanctuary (Santuario).png', 'See Invisibility (Ver lo invisble).png', 'Sending (Envio-Mensaje).png', 'Shield of Faith (Escudo de Fe).png', 'Silence (Silencio).png', 'Spare the Dying (Perdonar a los moribundos).png', 'Spirit Guardians (Guardianes espirituales).png', 'Spiritual Weapon (Arma espiritual).png', 'Thaumaturgy (Taumaturgia).png', 'Toll the Dead (Tañido de la muerte).png', 'Tongues (Lenguas- Idiomas).png', 'Virtue (Virtud).png'],
  minerva: ['Burla Viciosa.png', 'Detectar Magia.png', 'Disguise Self.png', 'Encantar Persona.png', 'Enemies Abound.png', 'Garras de Mantis.png', 'Imagen Mayor.png', 'Inspiracion Bardica.png', 'Mordida de Mantis.png', 'Palabra Sanadora.png', 'Patron Hipnotico.png', 'Sugerencia - Suggestion.png', 'Susurros Disonantes.png']
};
function readJson(name) { try { return JSON.parse(localStorage.getItem(name) || '{}'); } catch { return {}; } }
function clean(value) { return String(value ?? '').trim(); }
function key(value) { return clean(value).toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])); }
function saveSelections() { localStorage.setItem(selectionKey, JSON.stringify(state.selections)); }
function selectionId(spell) { return `${spell.owner}:${spell.id}`; }
const remoteSelections = {};
function approvedByDungeonMaster(spell) { return remoteSelections[selectionId(spell)]?.approved_by_dm === true || readJson('wizard-spells-selections-dungeon-master')[selectionId(spell)] === true; }
function selectedByUser(spell) { return remoteSelections[selectionId(spell)]?.selected_by_user === true || readJson(`wizard-spells-selections-${spell.owner}`)[selectionId(spell)] === true; }
async function loadRemoteSelections() {
  const response = await fetch(`${supabaseUrl}/rest/v1/spell_selections?select=character_id,spell_id,approved_by_dm,selected_by_user`, { headers: supabaseHeaders });
  if (!response.ok) throw new Error('No se pudieron sincronizar las selecciones');
  const rows = await response.json();
  rows.forEach(row => { remoteSelections[`${row.character_id}:${row.spell_id}`] = row; });
}
async function ensureRemoteRows(spells) {
  if (characterId !== 'dungeon-master') return;
  const existing = new Set(Object.keys(remoteSelections));
  const missing = spells.filter(spell => !existing.has(selectionId(spell))).map(spell => ({ character_id: spell.owner, spell_id: spell.id, approved_by_dm: false, selected_by_user: false }));
  for (let index = 0; index < missing.length; index += 100) {
    const batch = missing.slice(index, index + 100);
    const response = await fetch(`${supabaseUrl}/rest/v1/spell_selections`, { method: 'POST', headers: { ...supabaseHeaders, Prefer: 'return=minimal' }, body: JSON.stringify(batch) });
    if (!response.ok) throw new Error('No se pudieron crear todas las filas de selección');
    batch.forEach(row => { remoteSelections[`${row.character_id}:${row.spell_id}`] = row; });
  }
}
async function saveRemoteSelection(ownerId, spellId, changes) {
  const payload = { character_id: ownerId, spell_id: spellId, ...changes, updated_at: new Date().toISOString() };
  const response = await fetch(`${supabaseUrl}/rest/v1/spell_selections?on_conflict=character_id,spell_id`, { method: 'POST', headers: { ...supabaseHeaders, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error('No se pudo guardar la selección online');
  remoteSelections[`${ownerId}:${spellId}`] = { ...remoteSelections[`${ownerId}:${spellId}`], ...payload };
}
function typeKey(value) { const k = key(value); if (k.startsWith('dan')) return 'dano'; if (k.startsWith('efec')) return 'efecto'; return ''; }
function typeLabel(value) { const k = typeKey(value); return k === 'dano' ? 'Daño' : k === 'efecto' ? 'Efecto' : ''; }
async function supaSelect(table, query) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query || 'select=*'}`, { headers: supabaseHeaders });
  if (!response.ok) throw new Error(`No se pudo leer ${table}`);
  return response.json();
}
async function supaUpsert(table, payload, conflictCols) {
  const url = `${supabaseUrl}/rest/v1/${table}${conflictCols ? `?on_conflict=${conflictCols}` : ''}`;
  const response = await fetch(url, { method: 'POST', headers: { ...supabaseHeaders, Prefer: `resolution=merge-duplicates,return=representation` }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(`No se pudo guardar en ${table}`);
  return response.json();
}
async function supaDelete(table, match) {
  const params = Object.entries(match).map(([field, value]) => `${field}=eq.${encodeURIComponent(value)}`).join('&');
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${params}`, { method: 'DELETE', headers: supabaseHeaders });
  if (!response.ok) throw new Error(`No se pudo borrar en ${table}`);
}
async function loadCustomSpells() { state.customSpells = await supaSelect('custom_spells', 'select=*').catch(() => state.customSpells); }
async function loadCharacterLevels() {
  const rows = await supaSelect('character_levels', 'select=*').catch(() => []);
  state.characterLevels = {};
  rows.forEach(row => { state.characterLevels[row.character_id] = { px_level: row.px_level, stars: typeof row.stars === 'string' ? JSON.parse(row.stars || '{}') : (row.stars || {}) }; });
}
function spellType(spell) { return remoteSelections[selectionId(spell)]?.spell_type || spell.type; }
function spellImage(spell) { return spell.image || remoteSelections[selectionId(spell)]?.spell_image || ''; }
function customSpellToShape(row) {
  return { owner: row.owner, id: `custom-${row.id}`, name: row.name, level: row.level || 'Sin nivel', description: row.description || 'Sin descripción disponible.', dice: row.effect || '', range: row.range || '', concentration: row.concentration || '', duration: '', type: row.type || '', image: row.image || '', custom: true };
}
function customSpellsFor(ownerId) { return state.customSpells.filter(row => row.owner === ownerId).map(customSpellToShape); }
function composeSpells(owners) { return owners.flatMap(id => [...(state.spellCache[id] || []), ...customSpellsFor(id)]); }
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
  const nameParts = titleParts(name);
  let best = null;
  let bestScore = 0;
  files.forEach(item => {
    const englishItem = englishTitle(item);
    if (!englishName || !englishItem) return;
    let score = 0;
    if (englishName === englishItem) score = 4;
    else if (titleParts(item).some(itemPart => nameParts.includes(itemPart))) score = 3;
    else if (englishName.length >= 6 && englishItem.length >= 6 && (englishName.includes(englishItem) || englishItem.includes(englishName))) score = 2;
    else if (nameParts.some(namePart => titleParts(item).some(itemPart => namePart.startsWith(itemPart) || itemPart.startsWith(namePart)))) score = 1;
    if (score > bestScore) { bestScore = score; best = item; }
  });
  return best ? `${owner.root}${owner.imageFolder}${best}` : '';
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
    const type = pickValue(row, ['TIPO DE HECHIZO', 'Tipo de hechizo', 'Efecto', 'Tipo']);
    return { owner: ownerId, id: key(name), name, level: level || 'Sin nivel', description: description || 'Sin descripción disponible.', dice, range, concentration, duration, type, image: imageFor(name, ownerId) };
  });
}
function parseWorkbook(data, ownerId) {
  const book = XLSX.read(data, { type: 'array' });
  const rows = book.SheetNames.flatMap(sheetName => XLSX.utils.sheet_to_json(book.Sheets[sheetName], { defval: '' }));
  return normalizeRows(rows, ownerId);
}
function setupAccess() {
  const form = document.querySelector('#login-form');
  if (character) { document.body.classList.add('authenticated'); document.querySelector('#character-name').textContent = character.name; document.body.style.setProperty('--background-image', `url("${character.root}${character.background}")`); document.body.classList.toggle('dm-mode', characterId === 'dungeon-master'); document.body.classList.toggle('equipped-mode', view === 'equipped'); document.body.classList.toggle('image-zoom', characterId === 'vaelis' || characterId === 'viko'); if (!character.dm && (view === 'slots' || view === 'levels' || view === 'create')) { window.location.replace('index.html'); return false; } }
  form?.addEventListener('submit', event => { event.preventDefault(); const id = document.querySelector('#character-select').value; const pass = document.querySelector('#access-key').value; if (!characters[id] || characters[id].key !== pass) { document.querySelector('#login-error').hidden = false; return; } sessionStorage.setItem(sessionKey, id); window.location.href = 'index.html'; });
  document.querySelector('#logout')?.addEventListener('click', () => { sessionStorage.removeItem(sessionKey); window.location.href = 'index.html'; });
  return Boolean(character);
}
function isTruco(level) { const k = key(level); return k === 'tr' || k.startsWith('truco'); }
function levelAllowance(ownerId, level) {
  const config = state.characterLevels[ownerId];
  if (!config || !config.stars) return null;
  const raw = config.stars[level] ?? config.stars[String(level)];
  return raw === undefined ? null : Number(raw) || 0;
}
function selectedCountForLevel(ownerId, level) { return state.spells.filter(s => s.owner === ownerId && key(s.level) === key(level) && selectedByUser(s)).length; }
async function load() {
  if (view === 'levels' || view === 'create') {
    try { await Promise.all([loadCharacterLevels(), loadCustomSpells()]); elements.status.textContent = 'Listo'; } catch (error) { elements.status.textContent = 'No se pudo sincronizar con Supabase'; }
    renderTabs();
    if (view === 'levels') renderLevelsEditor(); else renderCreateView();
    return;
  }
  const owners = characterId === 'dungeon-master' && view === 'equipped'
    ? Object.keys(characters).filter(id => id !== 'dungeon-master')
    : [characterId === 'dungeon-master' ? state.activeOwner : characterId];
  await Promise.all(owners.map(async ownerId => {
    if (state.spellCache[ownerId]) return;
    const owner = characters[ownerId];
    const response = await fetch(`${owner.root}${owner.workbook}`);
    if (!response.ok) throw new Error(owner.name);
    state.spellCache[ownerId] = parseWorkbook(await response.arrayBuffer(), ownerId);
  }));
  try { await loadCustomSpells(); } catch (error) { /* opcional */ }
  state.spells = composeSpells(owners);
  try { await loadRemoteSelections(); } catch (error) { elements.status.textContent = 'Modo local: no se pudo conectar con Supabase'; }
  try { await ensureRemoteRows(state.spells); } catch (error) { elements.status.textContent = 'Supabase conectado parcialmente'; }
  try { await loadCharacterLevels(); } catch (error) { /* opcional */ }
  if (characterId !== 'dungeon-master') { state.spells.forEach(spell => { const id = selectionId(spell); if (!(id in state.selections)) state.selections[id] = false; }); saveSelections(); }
  if (elements.level) populateLevels();
  if (elements.type) populateTypeFilter();
  if (view === 'equipped') populateCharacterFilter();
  renderTabs();
  if (view !== 'slots') render();
  renderBanner();
  elements.status.textContent = view === 'slots' ? 'Ranuras listas para configurar' : `${filteredSpells().length} hechizos visibles`;
}
async function refreshRemote() {
  if (view !== 'inventory' && view !== 'equipped') return;
  try {
    await loadRemoteSelections();
    await loadCustomSpells();
    await loadCharacterLevels();
    const owners = characterId === 'dungeon-master' && view === 'equipped'
      ? Object.keys(characters).filter(id => id !== 'dungeon-master')
      : [characterId === 'dungeon-master' ? state.activeOwner : characterId];
    state.spells = composeSpells(owners);
    render();
    renderBanner();
  } catch (error) { /* se reintentará en el siguiente ciclo */ }
}
function populateCharacterFilter() {
  if (!elements.characterFilter || characterId !== 'dungeon-master' || view !== 'equipped') return;
  const owners = Object.keys(characters).filter(id => id !== 'dungeon-master');
  state.ownerFilters = [];
  elements.characterFilter.innerHTML = `<label><input type="checkbox" value="all"> <span>Todos</span></label>${owners.map(id => `<label><input type="checkbox" value="${id}"> <span>${escapeHtml(characters[id].name)}</span></label>`).join('')}`;
  updateCharacterSummary();
}
function updateCharacterSummary() {
  if (!elements.characterSummary) return;
  elements.characterSummary.textContent = state.ownerFilters.length ? `Personajes: ${state.ownerFilters.map(id => characters[id].name).join(', ')}` : 'Personajes: Todos';
}
function populateTypeFilter() {
  if (!elements.type) return;
  elements.type.innerHTML = `<label><input type="radio" name="type-filter" value="" ${!state.types.length ? 'checked' : ''}> <span>Todos</span></label><label><input type="radio" name="type-filter" value="dano" ${state.types[0] === 'dano' ? 'checked' : ''}> <span>Daño</span></label><label><input type="radio" name="type-filter" value="efecto" ${state.types[0] === 'efecto' ? 'checked' : ''}> <span>Efecto</span></label>`;
  updateTypeSummary();
}
function updateTypeSummary() {
  if (!elements.typeSummary) return;
  elements.typeSummary.textContent = `Tipo: ${state.types[0] ? typeLabel(state.types[0]) : 'Todos'}`;
}
function renderTabs() {
  if (!elements.tabs) return;
  elements.tabs.innerHTML = '';
  if (characterId !== 'dungeon-master') return;
  Object.keys(characters).filter(id => id !== 'dungeon-master').forEach(id => { const tab = document.createElement('button'); tab.className = `dm-tab ${state.activeOwner === id && view !== 'equipped' && view !== 'slots' && view !== 'levels' && view !== 'create' ? 'active' : ''}`; tab.textContent = characters[id].name; tab.onclick = () => { sessionStorage.setItem('wizard-spells-active-owner', id); if (view !== 'inventory') window.location.href = 'index.html'; else { state.activeOwner = id; renderTabs(); load(); } }; elements.tabs.appendChild(tab); });
  const equipped = document.createElement('button'); equipped.className = `dm-tab ${view === 'equipped' ? 'active' : ''}`; equipped.textContent = 'Hechizos equipados'; equipped.onclick = () => { window.location.href = 'grimorio equipado.html'; }; elements.tabs.appendChild(equipped);
  const slots = document.createElement('button'); slots.className = `dm-tab ${view === 'slots' ? 'active' : ''}`; slots.textContent = 'Ranuras Hechizo'; slots.onclick = () => { window.location.href = 'ranuras hechizo.html'; }; elements.tabs.appendChild(slots);
  const levels = document.createElement('button'); levels.className = `dm-tab ${view === 'levels' ? 'active' : ''}`; levels.textContent = 'Niveles Personaje'; levels.onclick = () => { window.location.href = 'niveles personaje.html'; }; elements.tabs.appendChild(levels);
  const create = document.createElement('button'); create.className = `dm-tab ${view === 'create' ? 'active' : ''}`; create.textContent = 'Crear Hechizo'; create.onclick = () => { window.location.href = 'crear hechizo.html'; }; elements.tabs.appendChild(create);
}
function filteredSpells() {
  const query = key(state.query);
  const activeType = state.types[0] || '';
  return state.spells.filter(spell => {
    const ownerVisible = characterId === 'dungeon-master' ? (view === 'equipped' ? (!state.ownerFilters.length || state.ownerFilters.includes(spell.owner)) : spell.owner === state.activeOwner) : true;
    const selectedVisible = characterId === 'dungeon-master' ? (view !== 'equipped' || selectedByUser(spell)) : (view !== 'equipped' ? approvedByDungeonMaster(spell) : selectedByUser(spell));
    return ownerVisible && selectedVisible && (!query || key(`${spell.name} ${spell.description}`).includes(query)) && (!state.levels.length || state.levels.includes(spell.level)) && (!state.imageOnly || spell.image) && (!activeType || typeKey(spellType(spell)) === activeType);
  });
}
function populateLevels() { const levels = [...new Set(state.spells.map(s => s.level))].sort((a, b) => a.localeCompare(b, 'es', { numeric: true })); elements.level.innerHTML = `<label><input type="checkbox" value="all"> <span>Todos los niveles</span></label><label class="image-filter"><input type="checkbox" value="image"> <span>Con imagen</span></label>${levels.map(level => `<label><input type="checkbox" value="${escapeHtml(level)}"> <span>${escapeHtml(level)}</span></label>`).join('')}`; }
function starsFor(spell) { const max = key(spell.level) === '1' ? 4 : 3; const value = state.stars[`${spell.owner}:${spell.id}`] || 0; return `<div class="stars">${Array.from({ length: max }, (_, i) => `<button type="button" class="star ${i < value ? 'lit' : ''}" data-star-owner="${spell.owner}" data-star-id="${escapeHtml(spell.id)}" data-star-value="${i + 1}">★</button>`).join('')}</div>`; }
function renderBanner() {
  if (!elements.banner) return;
  if (characterId === 'dungeon-master' || view !== 'inventory') { elements.banner.hidden = true; return; }
  const config = state.characterLevels[characterId];
  if (!config) { elements.banner.hidden = true; return; }
  const parts = Object.entries(config.stars || {}).filter(([, count]) => Number(count) > 0).sort((a, b) => Number(a[0]) - Number(b[0])).map(([level, count]) => `${count} hechizo${count > 1 ? 's' : ''} de nivel ${level}`);
  const summary = parts.length ? `Puedes seleccionar ${parts.join(' y ')}.` : 'El Dungeon Master aún no ha asignado ranuras de hechizo para este nivel.';
  elements.banner.hidden = false;
  elements.banner.innerHTML = `<strong>Nivel de PX: ${escapeHtml(config.px_level ?? '—')}.</strong> ${escapeHtml(summary)} Los trucos no tienen restricción.`;
}
function render() {
  const spells = filteredSpells();
  const currentSelections = state.spells.filter(selectedByUser).length;
  const countLink = document.querySelector('#nav-equipped-count');
  if (countLink) countLink.textContent = currentSelections;
  elements.count.textContent = spells.length;
  elements.grid.innerHTML = spells.map(spell => {
    const choice = characterId === 'dungeon-master' ? approvedByDungeonMaster(spell) : selectedByUser(spell);
    const hasDescription = Boolean(spell.description && spell.description !== 'Sin descripción disponible.');
    const descriptionMarkup = hasDescription ? `<p>${escapeHtml(spell.description)}</p><dl class="details">${spell.range ? `<div><dt>Alcance</dt><dd>${escapeHtml(spell.range)}</dd></div>` : ''}${spell.duration ? `<div><dt>Duración</dt><dd>${escapeHtml(spell.duration)}</dd></div>` : ''}${spell.dice ? `<div><dt>Efecto</dt><dd>${escapeHtml(spell.dice)}</dd></div>` : ''}</dl>` : '<p class="image-source-note">Información incluida en la imagen</p>';
    const currentType = spellType(spell);
    const type = typeKey(currentType);
    const typeEditor = characterId === 'dungeon-master' && view === 'equipped' ? `<div class="choice type-choice"><button class="choice-button dano ${type === 'dano' ? 'selected' : ''}" data-type-owner="${spell.owner}" data-type-id="${escapeHtml(spell.id)}" data-type-value="dano">Daño</button><button class="choice-button efecto ${type === 'efecto' ? 'selected' : ''}" data-type-owner="${spell.owner}" data-type-id="${escapeHtml(spell.id)}" data-type-value="efecto">Efecto</button></div>` : '';
    const image = spellImage(spell);
    const canUploadImage = characterId === 'dungeon-master' && view === 'inventory' && !image;
    const uploadMarkup = canUploadImage ? `<div class="card-upload"><label class="import-button">Subir imagen<input type="file" accept="image/*" class="card-image-input" data-image-owner="${spell.owner}" data-image-id="${escapeHtml(spell.id)}"></label><input type="text" class="card-image-url" placeholder="o pega una URL" data-image-owner="${spell.owner}" data-image-id="${escapeHtml(spell.id)}"></div>` : '';
    return `<article class="spell-card"><div class="card-art ${image ? '' : 'no-art'}">${image ? `<img src="${image}" alt="" loading="lazy">` : `<span>✦</span>${uploadMarkup}`}<b>${escapeHtml(spell.level)}</b></div><div class="card-content"><h2>${escapeHtml(spell.name)}</h2>${descriptionMarkup}<div class="card-footer"><div class="tags">${type ? `<span class="type-tag ${type}">${typeLabel(currentType)}</span>` : ''}${characterId === 'dungeon-master' ? `<span class="owner-tag">${escapeHtml(characters[spell.owner].name)}</span>` : ''}</div>${typeEditor}${view !== 'equipped' ? `<div class="choice"><button class="choice-button yes ${choice ? 'selected' : ''}" data-spell-owner="${spell.owner}" data-spell-id="${escapeHtml(spell.id)}" data-spell-level="${escapeHtml(spell.level)}" data-choice="yes">Sí</button><button class="choice-button no ${!choice ? 'selected' : ''}" data-spell-owner="${spell.owner}" data-spell-id="${escapeHtml(spell.id)}" data-spell-level="${escapeHtml(spell.level)}" data-choice="no">No</button></div>` : ''}</div></div></article>`;
  }).join('');
  elements.empty.hidden = spells.length > 0;
}
function renderSlots() { const owners = Object.keys(characters).filter(id => id !== 'dungeon-master'); elements.grid.innerHTML = owners.map(ownerId => `<section class="slot-panel"><h2>${escapeHtml(characters[ownerId].name)}</h2><div class="slot-levels">${['4', '3', '2', '1'].map(level => { const count = level === '1' ? 4 : 3; const value = state.stars[`${ownerId}:${level}`] || 0; return `<div class="slot-row"><strong>Nivel ${level}</strong><div class="slot-stars">${Array.from({ length: count }, (_, index) => `<button type="button" class="star ${index < value ? 'lit' : ''}" data-slot-owner="${ownerId}" data-slot-level="${level}" data-slot-value="${index + 1}">★</button>`).join('')}</div></div>`; }).join('')}</div></section>`).join(''); elements.empty.hidden = true; }
function renderLevelsEditor() {
  const owners = Object.keys(characters).filter(id => id !== 'dungeon-master');
  const editor = state.levelsEditor;
  if (!editor.characterId) editor.characterId = owners[0];
  const saved = state.characterLevels[editor.characterId];
  if (editor.loadedFor !== editor.characterId) { editor.px = saved?.px_level ?? ''; editor.stars = { ...(saved?.stars || {}) }; editor.loadedFor = editor.characterId; }
  elements.grid.innerHTML = `
    <section class="levels-panel">
      <label class="levels-field">Personaje
        <select id="levels-character">${owners.map(id => `<option value="${id}" ${editor.characterId === id ? 'selected' : ''}>${escapeHtml(characters[id].name)}</option>`).join('')}</select>
      </label>
      <label class="levels-field">Nivel de PX (número entero)
        <input id="levels-px" type="number" step="1" min="0" value="${escapeHtml(editor.px)}">
      </label>
      <div class="levels-grid">
        ${Array.from({ length: 9 }, (_, i) => i + 1).map(level => `<div class="levels-row"><strong>Nivel ${level}</strong><div class="slot-stars">${Array.from({ length: 4 }, (_, index) => `<button type="button" class="star ${index < Number(editor.stars[level] || 0) ? 'lit' : ''}" data-level-star="${level}" data-level-star-value="${index + 1}">★</button>`).join('')}</div></div>`).join('')}
      </div>
      <div class="levels-actions">
        <button id="levels-save" class="login-button" type="button">Guardar</button>
        <button id="levels-delete" class="ghost-button" type="button">Borrar</button>
      </div>
    </section>`;
  elements.empty.hidden = true;
  document.querySelector('#levels-character').addEventListener('change', event => { editor.characterId = event.target.value; renderLevelsEditor(); });
  document.querySelector('#levels-px').addEventListener('input', event => { editor.px = event.target.value; });
  elements.grid.querySelectorAll('[data-level-star]').forEach(button => button.addEventListener('click', () => {
    const level = button.dataset.levelStar; const value = Number(button.dataset.levelStarValue);
    editor.stars[level] = Number(editor.stars[level] || 0) === value ? value - 1 : value;
    renderLevelsEditor();
  }));
  document.querySelector('#levels-save').addEventListener('click', async () => {
    const payload = { character_id: editor.characterId, px_level: Number(editor.px) || 0, stars: editor.stars, updated_at: new Date().toISOString() };
    try {
      await supaUpsert('character_levels', payload, 'character_id');
      state.characterLevels[editor.characterId] = { px_level: payload.px_level, stars: payload.stars };
      elements.status.textContent = `Guardado: ${characters[editor.characterId].name} ya puede ver sus ranuras de nivel en su inventario.`;
      editor.px = ''; editor.stars = {};
      renderLevelsEditor();
    } catch (error) { elements.status.textContent = 'No se pudo guardar en Supabase'; }
  });
  document.querySelector('#levels-delete').addEventListener('click', async () => {
    try { await supaDelete('character_levels', { character_id: editor.characterId }); delete state.characterLevels[editor.characterId]; editor.px = ''; editor.stars = {}; renderLevelsEditor(); elements.status.textContent = 'Niveles borrados'; } catch (error) { elements.status.textContent = 'No se pudo borrar en Supabase'; }
  });
}
function onCreateFileChange(event) { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { state.createForm.image = reader.result; renderCreateView(); }; reader.readAsDataURL(file); }
function renderCreateView() {
  const owners = Object.keys(characters).filter(id => id !== 'dungeon-master');
  const form = state.createForm || (state.createForm = { name: '', description: '', type: 'dano', level: 'Truco', range: '', effect: '', concentration: 'No', owner: owners[0], image: '' });
  elements.grid.innerHTML = `
    <article class="spell-card spell-form">
      <div class="card-art ${form.image ? '' : 'no-art'}">${form.image ? `<img src="${form.image}" alt="">` : '<span>✦</span>'}
        <label class="import-button">Subir imagen<input id="create-image" type="file" accept="image/*"></label>
      </div>
      <div class="card-content">
        <input id="create-name" placeholder="Nombre del hechizo" value="${escapeHtml(form.name)}">
        <input id="create-image-url" placeholder="...o pega una URL de imagen" value="${escapeHtml(form.image && form.image.startsWith('http') ? form.image : '')}">
        <textarea id="create-description" placeholder="Descripción">${escapeHtml(form.description)}</textarea>
        <div class="type-toggle">
          <button type="button" class="ghost-button ${form.type === 'dano' ? 'active' : ''}" data-create-type="dano">Daño</button>
          <button type="button" class="ghost-button ${form.type === 'efecto' ? 'active' : ''}" data-create-type="efecto">Efecto</button>
        </div>
        <label class="levels-field">Nivel
          <select id="create-level">${['Truco', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map(level => `<option value="${level}" ${form.level === level ? 'selected' : ''}>${level === 'Truco' ? 'Truco' : `Nivel ${level}`}</option>`).join('')}</select>
        </label>
        <input id="create-range" placeholder="Alcance" value="${escapeHtml(form.range)}">
        <input id="create-effect" placeholder="Efecto / tirada" value="${escapeHtml(form.effect)}">
        <label class="levels-field">Concentración
          <select id="create-concentration"><option ${form.concentration === 'No' ? 'selected' : ''}>No</option><option ${form.concentration === 'Sí' ? 'selected' : ''}>Sí</option></select>
        </label>
        <label class="levels-field">Personaje
          <select id="create-owner">${owners.map(id => `<option value="${id}" ${form.owner === id ? 'selected' : ''}>${escapeHtml(characters[id].name)}</option>`).join('')}</select>
        </label>
        <button id="create-save" class="login-button" type="button">Guardar</button>
      </div>
    </article>`;
  elements.empty.hidden = true;
  document.querySelector('#create-name').addEventListener('input', e => form.name = e.target.value);
  document.querySelector('#create-description').addEventListener('input', e => form.description = e.target.value);
  document.querySelector('#create-level').addEventListener('change', e => form.level = e.target.value);
  document.querySelector('#create-range').addEventListener('input', e => form.range = e.target.value);
  document.querySelector('#create-effect').addEventListener('input', e => form.effect = e.target.value);
  document.querySelector('#create-concentration').addEventListener('change', e => form.concentration = e.target.value);
  document.querySelector('#create-owner').addEventListener('change', e => form.owner = e.target.value);
  elements.grid.querySelectorAll('[data-create-type]').forEach(button => button.addEventListener('click', () => { form.type = button.dataset.createType; renderCreateView(); }));
  document.querySelector('#create-image').addEventListener('change', onCreateFileChange);
  document.querySelector('#create-image-url').addEventListener('input', event => {
    form.image = event.target.value.trim();
    const art = elements.grid.querySelector('.card-art');
    art.classList.toggle('no-art', !form.image);
    art.innerHTML = (form.image ? `<img src="${form.image}" alt="">` : '<span>✦</span>') + '<label class="import-button">Subir imagen<input id="create-image" type="file" accept="image/*"></label>';
    document.querySelector('#create-image').addEventListener('change', onCreateFileChange);
  });
  document.querySelector('#create-save').addEventListener('click', async () => {
    if (!form.name.trim() || !form.owner) { elements.status.textContent = 'Completa al menos el nombre y el personaje'; return; }
    try {
      const [created] = await supaUpsert('custom_spells', { owner: form.owner, name: form.name, description: form.description, type: form.type, level: form.level, range: form.range, effect: form.effect, concentration: form.concentration, image: form.image });
      state.customSpells.push(created);
      const savedOwner = form.owner;
      state.createForm = { name: '', description: '', type: 'dano', level: 'Truco', range: '', effect: '', concentration: 'No', owner: savedOwner, image: '' };
      elements.status.textContent = `Guardado: revisa la pestaña de ${characters[savedOwner].name} para elegir Sí/No y que le aparezca a los demás.`;
      renderCreateView();
    } catch (error) { elements.status.textContent = 'No se pudo guardar el hechizo en Supabase'; }
  });
}
if (setupAccess()) {
  elements.search?.addEventListener('input', event => { state.query = event.target.value; render(); });
  elements.level?.addEventListener('change', event => { const input = event.target.closest('input'); if (!input) return; const all = [...elements.level.querySelectorAll('input')]; if (input.value === 'all' && input.checked) all.filter(i => i !== input).forEach(i => { i.checked = false; }); if (input.value !== 'all' && input.checked) all.find(i => i.value === 'all').checked = false; state.imageOnly = Boolean(all.find(i => i.value === 'image')?.checked); state.levels = all.filter(i => i.checked && i.value !== 'all' && i.value !== 'image').map(i => i.value); render(); });
  elements.type?.addEventListener('change', event => { const input = event.target.closest('input'); if (!input) return; state.types = input.value ? [input.value] : []; updateTypeSummary(); render(); });
  elements.characterFilter?.addEventListener('change', event => { const input = event.target.closest('input'); if (!input) return; const all = [...elements.characterFilter.querySelectorAll('input')]; if (input.value === 'all' && input.checked) all.filter(item => item !== input).forEach(item => { item.checked = false; }); if (input.value !== 'all' && input.checked) all.find(item => item.value === 'all').checked = false; state.ownerFilters = all.filter(item => item.checked && item.value !== 'all').map(item => item.value); updateCharacterSummary(); render(); });
  elements.reload?.addEventListener('click', () => { state.spellCache = {}; load(); });
  elements.resetStars?.addEventListener('click', () => { state.stars = {}; localStorage.setItem('wizard-spells-stars', '{}'); if (view === 'slots') renderSlots(); else render(); });
  elements.grid?.addEventListener('click', async event => {
    const typeChoice = event.target.closest('[data-type-owner]');
    if (typeChoice) {
      const ownerId = typeChoice.dataset.typeOwner; const spellId = typeChoice.dataset.typeId; const value = typeChoice.dataset.typeValue;
      remoteSelections[`${ownerId}:${spellId}`] = { ...remoteSelections[`${ownerId}:${spellId}`], spell_type: value };
      render();
      try { await saveRemoteSelection(ownerId, spellId, { spell_type: value }); } catch (error) { elements.status.textContent = 'No se pudo sincronizar el tipo de hechizo'; }
      return;
    }
    const choice = event.target.closest('[data-spell-owner]');
    if (choice) {
      const ownerId = choice.dataset.spellOwner; const spellId = choice.dataset.spellId; const level = choice.dataset.spellLevel; const selected = choice.dataset.choice === 'yes';
      if (characterId !== 'dungeon-master' && selected && !isTruco(level)) {
        const allowed = levelAllowance(ownerId, level);
        const wasSelected = state.selections[`${ownerId}:${spellId}`] === true;
        if (allowed !== null && !wasSelected && selectedCountForLevel(ownerId, level) >= allowed) {
          alert(`Solo puedes tener ${allowed} hechizo(s) de nivel ${level} equipados. Cambia otro a "No" para elegir este.`);
          return;
        }
      }
      state.selections[`${ownerId}:${spellId}`] = selected; saveSelections();
      try { await saveRemoteSelection(ownerId, spellId, characterId === 'dungeon-master' ? { approved_by_dm: selected } : { selected_by_user: selected }); } catch (error) { elements.status.textContent = 'Guardado local: no se pudo sincronizar'; }
      render(); renderBanner();
      return;
    }
    const slot = event.target.closest('[data-slot-value]');
    if (slot) { state.stars[`${slot.dataset.slotOwner}:${slot.dataset.slotLevel}`] = Number(slot.dataset.slotValue); localStorage.setItem('wizard-spells-stars', JSON.stringify(state.stars)); renderSlots(); }
  });
  elements.grid?.addEventListener('change', async event => {
    const fileInput = event.target.closest('.card-image-input');
    const urlInput = event.target.closest('.card-image-url');
    const target = fileInput || urlInput;
    if (!target) return;
    const ownerId = target.dataset.imageOwner; const spellId = target.dataset.imageId;
    const applyImage = async value => {
      if (!value) return;
      remoteSelections[`${ownerId}:${spellId}`] = { ...remoteSelections[`${ownerId}:${spellId}`], spell_image: value };
      render();
      try { await saveRemoteSelection(ownerId, spellId, { spell_image: value }); } catch (error) { elements.status.textContent = 'No se pudo sincronizar la imagen'; }
    };
    if (fileInput) {
      const file = fileInput.files?.[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = () => applyImage(reader.result);
      reader.readAsDataURL(file);
    } else {
      await applyImage(urlInput.value.trim());
    }
  });
  load().then(() => { if (view === 'slots') renderSlots(); if (view === 'inventory' || view === 'equipped') setInterval(refreshRemote, 5000); }).catch(() => { elements.status.textContent = 'No se pudieron cargar los datos'; elements.empty.hidden = false; });
}
