const sessionKey = 'wizard-spells-character';
const view = document.body.dataset.view || 'inventory';
const characters = {
  frederick: { name: 'Frederick D´Rosectta', key: 'rosas', root: '../Frederick D’Rosectta/', workbook: 'Frederick D´Rosectta.xlsx', imageFolder: 'Imagenes Vampire/', background: '../Fondos DM/God Fondo.png' },
  jeanne: { name: 'Jeanne Di Arc', key: 'artesana', root: '../Jeanne Di Arc/', workbook: 'Conjuros Clerigo Remastered.xlsx', imageFolder: 'Imagenes Ghost/', background: '../Fondos DM/God Fondo.png' },
  luxxxi: { name: 'Luxxxi Fernando', key: 'tiflin', root: '../Luxxxi Fernando/', workbook: 'Luxxxi Fernando.xlsx', imageFolder: 'Imagenes Tiflin/', background: '../Fondos DM/God Fondo.png' },
  minerva: { name: 'Minerva Di Coleoptera', key: 'polvito', root: '../Minerva Di Coleoptera/', workbook: 'Minerva Di Coleoptera.xlsx', imageFolder: 'Imagenes/', background: '../Fondos DM/God Fondo.png' },
  viko: { name: 'Viko', key: 'paladin', root: '../Viko/', workbook: 'Paladin Spells.xlsx', imageFolder: 'Imagenes/', background: 'Fondos/Paladin Fondo.png' },
  vaelis: { name: 'Vaelis', key: 'Miaw', root: './', workbook: 'Wizard Spells.xlsx', imageFolder: 'imagenes/', background: 'fondos/wizard fondo.png' },
  'dungeon-master': { name: 'Dungeon Master', key: 'Maru', root: '../', dm: true, background: 'Fondos DM/God Fondo.png' }
};
const characterId = sessionStorage.getItem(sessionKey);
const character = characters[characterId];
const selectionKey = `wizard-spells-selections-${characterId || 'guest'}`;
const state = { spells: [], activeOwner: sessionStorage.getItem('wizard-spells-active-owner') || 'vaelis', query: '', levels: [], imageOnly: false, selections: readJson(selectionKey), stars: readJson('wizard-spells-stars') };
const elements = {
  grid: document.querySelector('#spell-grid'), empty: document.querySelector('#empty-state'), count: document.querySelector('#spell-count'), status: document.querySelector('#source-status'), search: document.querySelector('#search'), level: document.querySelector('#level-filter'), levelSummary: document.querySelector('#level-summary'), reload: document.querySelector('#reload'), tabs: document.querySelector('#dm-tabs'), resetStars: document.querySelector('#reset-stars')
};
const imageFiles = {
  viko: ['Aid.png', 'Bless (Bendecir).png', 'branding smite.png', 'Ceremony.png', 'Command (Orden).png', 'compelled duel.png', 'Cure Wounds (Curar Heridas).png', 'detect evil and good.png', 'Detect magic.png', 'Detect poison and disease.png', 'Divine favor.png', 'Divine sense.png', 'Divine Smite.png', 'enhance ability.png', 'Find Steed.png', 'Gentle Repose.png', 'Guiding Bolt.png', 'heroism.png', 'Lay on hands.png', 'Lesser Restoration.png', 'Locate Object.png', 'Magic weapon.png', 'Prayer of healing.png', 'protection from evile and good.png', 'Protection from Poison.png', 'Purify Food and Drink.png', 'Searing orb.png', 'Searing smite.png', 'shield of faith.png', 'shining smite.png', 'Thunderous Smite.png', 'Wardaway.png', 'Warding bond.png', 'wrathful smite.png', 'Zone of truth.png'],
  frederick: ['Absorb Elements.png', 'Burning Hands.png', 'Charm Person.png', 'Darkness.png', 'Fire Bolt.png', 'Fireball.png', 'Mage Hand.png', 'Misty Step.png', 'Prestidigitation.png', 'Scorching Ray.png', 'Shield.png', 'Vampire Bite.png', 'Vampire Touch.png'],
  jeanne: ['Aid (Ayuda).png', 'Animate Dead (Animar a los muertos).png', 'Bane (Perdicion).png', 'Bestow Curse (Imponer maldición).png', 'Bless (Bendencir).png', 'Blindness-Deafness (Ceguera-Sordera).png', 'Calm Emotions (Calmar emociones).png', 'Clairvoyance (Clarividencia).png', 'Create Food and Water (Crear comida y agua).png', 'Cure Wounds (Curar Heridas).png', 'Daylight (Luz de Dia).png', 'Dispel Magic (Disipar magia).png', 'Feign Death (Simular muerte).png', 'Glyph of Warding (Glifo de custodia).png', 'Guidance (Guia).png', 'Guiding Bolt (Rayo radiante).png', 'Healing Word (Palabra Curativa).png', 'Hold Person (Inmovilizar persona).png', 'Inflict Wounds (Infligir heridas).png', 'Lesser Restoration (Restauración menor).png', 'Light (Luz de Dia).png', 'Mass Healing Word (Palabra de curación en masa).png', 'Prayer of Healing (Oración de sanación).png', 'Protection from Energy (Protección contra la energía).png', 'Remove Curse (Remover Maldicion).png', 'Revivify (Revivificar).png', 'Sacred Flame (Llama Sagrada).png', 'Sanctuary (Santuario).png', 'See Invisibility (Ver lo invisble).png', 'Sending (Envio-Mensaje).png', 'Shield of Faith (Escudo de Fe).png', 'Silence (Silencio).png', 'Spare the Dying (Perdonar a los moribundos).png', 'Spirit Guardians (Guardianes espirituales).png', 'Spiritual Weapon (Arma espiritual).png', 'Thaumaturgy (Taumaturgia).png', 'Toll the Dead (Tañido de la muerte).png', 'Tongues (Lenguas- Idiomas).png', 'Virtue (Virtud).png'],
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
function imageFor(name, ownerId) {
  const owner = characters[ownerId];
  if (ownerId === 'vaelis') {
    const known = { 'acid splash': 'Acid Splash.png', 'chill touch': 'Chill Touch.png', 'dancing lights': 'Dancing Lights.png', elementalism: 'Elementalism.png', 'fire bolt': 'Fire bolt.png', light: 'Light.png', 'mage hand': 'Mage hand.png', mending: 'Mending.png', message: 'Message.png', 'true strike': 'true strike.png', sleep: 'sleep.png', 'silent image': 'silent image.png', 'shocking grasp': 'shocking grasp.png', 'disguise self': 'self disguise.png', 'ray of frost': 'ray of frost.png', prestidigitation: 'prestidigitation.png', 'poison spray': 'Poison Spray.png', 'minor illusion': 'Minor Illusion.png', 'mage armor': 'mage armor.png', invisibility: 'invisibility.png', 'find familiar': 'find familiar.png', 'color spray': 'color spary.png' };
    return known[key(name)] ? `${owner.root}${owner.imageFolder}${known[key(name)]}` : '';
  }
  const normalizedName = key(name).replace(/\s*\([^)]*\)/g, '').trim();
  const files = imageFiles[ownerId] || [];
  const file = files.find(item => { const stem = key(item.replace(/\.png$/i, '')); return stem === key(name) || stem === normalizedName || stem.startsWith(normalizedName) || normalizedName.startsWith(stem); });
  return file ? `${owner.root}${owner.imageFolder}${file}` : '';
}
function normalizeRows(rows, ownerId) {
  return rows.filter(row => clean(row.HECHIZO || row['Nombre del conjuro'])).map(row => { const name = clean(row.HECHIZO || row['Nombre del conjuro']); return { owner: ownerId, id: key(name), name, level: clean(row.NIVEL || row.Nivel) || 'Sin nivel', description: clean(row.DESCRIPCION || row.Descripción) || 'Sin descripción disponible.', dice: clean(row.DADOS || row.TIRADA || row['Tipo de tirada']), range: clean(row.ALCANCE || row['CD mínima / Cómo impacta']), concentration: clean(row.CONCENTRACION), duration: clean(row['DURACION (1 turno  = 1 MINUTO)'] || row['DURACION (1 turno = 1 MINUTO)']), image: imageFor(name, ownerId) }; });
}
function parseWorkbook(data, ownerId) { const book = XLSX.read(data, { type: 'array' }); return normalizeRows(XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { defval: '' }), ownerId); }
function setupAccess() {
  const form = document.querySelector('#login-form');
  if (character) { document.body.classList.add('authenticated'); document.querySelector('#character-name').textContent = character.name; document.body.style.setProperty('--background-image', `url("${character.root}${character.background}")`); document.body.classList.toggle('dm-mode', characterId === 'dungeon-master'); document.body.classList.toggle('equipped-mode', view === 'equipped'); document.body.classList.toggle('image-zoom', characterId === 'vaelis' || characterId === 'viko'); }
  form?.addEventListener('submit', event => { event.preventDefault(); const id = document.querySelector('#character-select').value; const pass = document.querySelector('#access-key').value; if (!characters[id] || characters[id].key !== pass) { document.querySelector('#login-error').hidden = false; return; } sessionStorage.setItem(sessionKey, id); window.location.href = 'index.html'; });
  document.querySelector('#logout')?.addEventListener('click', () => { sessionStorage.removeItem(sessionKey); window.location.href = 'index.html'; });
  return Boolean(character);
}
async function load() {
  const owners = characterId === 'dungeon-master' ? Object.keys(characters).filter(id => id !== 'dungeon-master') : [characterId];
  const sets = await Promise.all(owners.map(async ownerId => { const owner = characters[ownerId]; const response = await fetch(`${owner.root}${owner.workbook}`); if (!response.ok) throw new Error(owner.name); return parseWorkbook(await response.arrayBuffer(), ownerId); }));
  state.spells = sets.flat();
  if (characterId !== 'dungeon-master') { state.spells.forEach(spell => { const id = selectionId(spell); if (!(id in state.selections)) state.selections[id] = false; }); saveSelections(); }
  populateLevels(); renderTabs(); render(); elements.status.textContent = `${filteredSpells().length} hechizos visibles`;
}
function renderTabs() {
  if (!elements.tabs) return;
  elements.tabs.innerHTML = '';
  if (characterId !== 'dungeon-master') return;
  Object.keys(characters).filter(id => id !== 'dungeon-master').forEach(id => { const tab = document.createElement('button'); tab.className = `dm-tab ${state.activeOwner === id && view !== 'equipped' ? 'active' : ''}`; tab.textContent = characters[id].name; tab.onclick = () => { sessionStorage.setItem('wizard-spells-active-owner', id); if (view === 'equipped') window.location.href = 'index.html'; else { state.activeOwner = id; renderTabs(); render(); } }; elements.tabs.appendChild(tab); });
  const equipped = document.createElement('button'); equipped.className = 'dm-tab'; equipped.textContent = 'Hechizos equipados'; equipped.onclick = () => { window.location.href = 'grimorio equipado.html'; }; elements.tabs.appendChild(equipped);
}
function filteredSpells() { const query = key(state.query); return state.spells.filter(spell => { const ownerVisible = characterId === 'dungeon-master' ? (view === 'equipped' || spell.owner === state.activeOwner) : true; const selectedVisible = characterId === 'dungeon-master' ? (view !== 'equipped' || selectedByUser(spell)) : (view !== 'equipped' ? approvedByDungeonMaster(spell) : selectedByUser(spell)); return ownerVisible && selectedVisible && (!query || key(`${spell.name} ${spell.description}`).includes(query)) && (!state.levels.length || state.levels.includes(spell.level)) && (!state.imageOnly || spell.image); }); }
function populateLevels() { const levels = [...new Set(state.spells.map(s => s.level))].sort((a, b) => a.localeCompare(b, 'es', { numeric: true })); elements.level.innerHTML = `<label><input type="checkbox" value="all"> <span>Todos los niveles</span></label><label class="image-filter"><input type="checkbox" value="image"> <span>Con imagen</span></label>${levels.map(level => `<label><input type="checkbox" value="${escapeHtml(level)}"> <span>${escapeHtml(level)}</span></label>`).join('')}`; }
function starsFor(spell) { const max = key(spell.level) === '1' ? 4 : 3; const value = state.stars[`${spell.owner}:${spell.id}`] || 0; return `<div class="stars">${Array.from({ length: max }, (_, i) => `<button type="button" class="star ${i < value ? 'lit' : ''}" data-star-owner="${spell.owner}" data-star-id="${escapeHtml(spell.id)}" data-star-value="${i + 1}">★</button>`).join('')}</div>`; }
function render() { const spells = filteredSpells(); elements.count.textContent = spells.length; elements.grid.innerHTML = spells.map(spell => { const choice = characterId === 'dungeon-master' ? approvedByDungeonMaster(spell) : selectedByUser(spell); return `<article class="spell-card"><div class="card-art ${spell.image ? '' : 'no-art'}">${spell.image ? `<img src="${spell.image}" alt="" loading="lazy">` : '<span>✦</span>'}<b>${escapeHtml(spell.level)}</b>${characterId === 'dungeon-master' && view === 'equipped' ? starsFor(spell) : ''}</div><div class="card-content"><h2>${escapeHtml(spell.name)}</h2><p>${escapeHtml(spell.description)}</p><dl class="details">${spell.range ? `<div><dt>Alcance</dt><dd>${escapeHtml(spell.range)}</dd></div>` : ''}${spell.duration ? `<div><dt>Duración</dt><dd>${escapeHtml(spell.duration)}</dd></div>` : ''}${spell.dice ? `<div><dt>Efecto</dt><dd>${escapeHtml(spell.dice)}</dd></div>` : ''}</dl><div class="card-footer"><div class="tags">${characterId === 'dungeon-master' ? `<span class="owner-tag">${escapeHtml(characters[spell.owner].name)}</span>` : ''}</div>${view !== 'equipped' ? `<div class="choice"><button class="choice-button yes ${choice ? 'selected' : ''}" data-spell-owner="${spell.owner}" data-spell-id="${escapeHtml(spell.id)}" data-choice="yes">Sí</button><button class="choice-button no ${!choice ? 'selected' : ''}" data-spell-owner="${spell.owner}" data-spell-id="${escapeHtml(spell.id)}" data-choice="no">No</button></div>` : ''}</div></div></article>`; }).join(''); elements.empty.hidden = spells.length > 0; }
if (setupAccess()) {
  elements.search?.addEventListener('input', event => { state.query = event.target.value; render(); });
  elements.level?.addEventListener('change', event => { const input = event.target.closest('input'); if (!input) return; const all = [...elements.level.querySelectorAll('input')]; if (input.value === 'all' && input.checked) all.filter(i => i !== input).forEach(i => { i.checked = false; }); if (input.value !== 'all' && input.checked) all.find(i => i.value === 'all').checked = false; state.imageOnly = Boolean(all.find(i => i.value === 'image')?.checked); state.levels = all.filter(i => i.checked && i.value !== 'all' && i.value !== 'image').map(i => i.value); render(); });
  elements.reload?.addEventListener('click', load);
  elements.resetStars?.addEventListener('click', () => { state.stars = {}; localStorage.setItem('wizard-spells-stars', '{}'); render(); });
  elements.grid?.addEventListener('click', event => { const choice = event.target.closest('[data-spell-owner]'); if (choice) { state.selections[`${choice.dataset.spellOwner}:${choice.dataset.spellId}`] = choice.dataset.choice === 'yes'; saveSelections(); render(); return; } const star = event.target.closest('[data-star-value]'); if (star) { state.stars[`${star.dataset.starOwner}:${star.dataset.starId}`] = Number(star.dataset.starValue); localStorage.setItem('wizard-spells-stars', JSON.stringify(state.stars)); render(); } });
  load().catch(() => { elements.status.textContent = 'No se pudieron cargar los datos'; elements.empty.hidden = false; });
}
