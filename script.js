

// ---------- Logique globale ----------
const STEPS = [
  { key: 'infos', file: 'infos.html', label: 'Infos' },
  { key: 'planning', file: 'planning.html', label: 'Planning' },
  { key: 'niveau', file: 'niveau.html', label: 'Niveau' },
  { key: 'materiel', file: 'matos.html', label: 'Matériel' },
  { key: 'poste', file: 'poste.html', label: 'Poste' },
  { key: 'target', file: 'target.html', label: 'Target' },
  { key: 'frequence', file: 'frequence.html', label: 'Fréquence' },
  { key: 'pp', file: 'pp.html', label: 'Préparation physique' },
  { key: 'blessures', file: 'blessures.html', label: 'Blessures' }
];

function currentStepIndex(){
  const path = window.location.pathname.split('/').pop();
  return STEPS.findIndex(s => s.file === path);
}

function initProgressBar(){
  const idx = currentStepIndex();
  const fill = document.getElementById('progress-fill');
  const text = document.getElementById('progress-text');
  if (idx === -1 || !fill || !text) return;
  const percent = Math.round(((idx + 1) / STEPS.length) * 100);
  fill.style.width = percent + '%';
  text.textContent = percent + '%';
}

document.addEventListener('DOMContentLoaded', initProgressBar);




// ---------- Stockage des réponses (partagé entre toutes les pages) ----------
const ANSWERS_KEY = 'myprog-answers';

function saveAnswer(key, value){
  const data = getAnswers();
  data[key] = value;
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(data));
}

function getAnswers(){
  try {
    return JSON.parse(localStorage.getItem(ANSWERS_KEY)) || {};
  } catch (e) {
    return {};
  }
}



// ---------- Logique de la page Planning (drag & drop) ----------
document.addEventListener('DOMContentLoaded', () => {
  const bank = document.getElementById('activity-bank');
  if (!bank) return; // pas sur la page planning

  // Rendre chaque pastille déjà présente dans le HTML "draggable"
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', chip.dataset.id);
      e.dataTransfer.effectAllowed = 'move';
      requestAnimationFrame(() => chip.classList.add('dragging'));
    });
    chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
  });

  // Toutes les zones de dépôt : le vivier + les 7 colonnes
  const dropZones = [bank, ...document.querySelectorAll('.drop-zone')];

  dropZones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zone.classList.add('over');
    });

    zone.addEventListener('dragleave', () => zone.classList.remove('over'));

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('over');
      const id = e.dataTransfer.getData('text/plain');
      const chip = document.querySelector(`[data-id="${id}"]`);
      if (chip) zone.appendChild(chip);
    });
  });

    const validerLink = document.getElementById('valider-planning');
  const weekBoard = document.querySelector('.week-board');

  if (validerLink){
    validerLink.addEventListener('click', (e) => {
      const chipsPlacees = document.querySelectorAll('.drop-zone .chip');

      if (chipsPlacees.length === 0){
        e.preventDefault(); // on bloque la navigation
        weekBoard.classList.remove('shake-error');
        void weekBoard.offsetWidth; // force le reflow pour pouvoir rejouer l'animation
        weekBoard.classList.add('shake-error');
        return;
      }

      const summary = [];
      document.querySelectorAll('.day-column').forEach(col => {
        const dayName = col.querySelector('h2').textContent;
        const chipsInDay = col.querySelectorAll('.drop-zone .chip');
        if (chipsInDay.length){
          const names = Array.from(chipsInDay).map(c => c.textContent.trim()).join('+');
          summary.push(dayName + ':' + names);
        }
      });

      saveAnswer('planning', summary.join(','));
      // pas de e.preventDefault() : le lien navigue normalement
    });
  }
});

// ---------- Logique de la page Niveau (pyramide(s) cliquable(s)) ----------
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pyramid');
  const container2 = document.getElementById('pyramid-2');
  if (!container) return; // pas sur la page niveau

  const levelsHomme      = ['L1', 'L2', 'L3', 'N2', 'N3', 'R1', 'R2', 'R3', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'];
  const levelsFemme11    = ['L1', 'L2', 'L3', 'R1F', 'R2F', 'R3F', 'D1F', 'D2F', 'D3F', 'D4F', 'D5F'];
  const levelsFemme8     = ['D1F', 'D2F', 'D3F', 'D4F', 'D5F'];

  const svgNS = 'http://www.w3.org/2000/svg';
  const PYRAMID_WIDTH = 640;
  const PYRAMID_HEIGHT = 512; // hauteur fixe : chaque pyramide se répartit dedans, quel que soit son nombre de niveaux

  const colorTop = [47, 93, 83];
  const colorBottom = [225, 221, 208];

  function lerp(a, b, t){ return Math.round(a + (b - a) * t); }

  function rowRGB(t){
    return [
      lerp(colorBottom[0], colorTop[0], t),
      lerp(colorBottom[1], colorTop[1], t),
      lerp(colorBottom[2], colorTop[2], t)
    ];
  }

  // Luminosité perçue (0 = noir, 1 = blanc) : sert à choisir un texte lisible sur CE fond précis
  function luminance(r, g, b){
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }

  function renderPyramid(targetEl, levels, ariaLabel){
    const width = PYRAMID_WIDTH;
    const height = PYRAMID_HEIGHT;
    const rowHeight = height / levels.length; // ← s'adapte automatiquement au nombre de niveaux
    const minWidth = 0;
    const maxWidth = 600;

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('role', 'group');
    svg.setAttribute('aria-label', ariaLabel);

    levels.forEach((level, i) => {
      const t = i / (levels.length - 1);
      const topWidth = minWidth + (maxWidth - minWidth) * (i / levels.length);
      const bWidth = minWidth + (maxWidth - minWidth) * ((i + 1) / levels.length);
      const yTop = i * rowHeight;
      const yBottom = (i + 1) * rowHeight;
      const xTopLeft = (width - topWidth) / 2;
      const xTopRight = (width + topWidth) / 2;
      const xBottomLeft = (width - bWidth) / 2;
      const xBottomRight = (width + bWidth) / 2;

      const g = document.createElementNS(svgNS, 'g');
      g.setAttribute('class', 'level');
      g.setAttribute('data-level', level);
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-pressed', 'false');
      g.setAttribute('aria-label', 'Niveau ' + level);

      const [r, gCol, b] = rowRGB(t);

      const polygon = document.createElementNS(svgNS, 'polygon');
      polygon.setAttribute('points', `${xTopLeft},${yTop} ${xTopRight},${yTop} ${xBottomRight},${yBottom} ${xBottomLeft},${yBottom}`);
      polygon.setAttribute('fill', `rgb(${r},${gCol},${b})`);
      g.appendChild(polygon);

      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', width / 2);
      text.setAttribute('y', (yTop + yBottom) / 2 + 5);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', luminance(r, gCol, b) < 0.55 ? '#FBFAF6' : '#23262A');
      text.textContent = level;
      g.appendChild(text);

      function selectLevel(){
        document.querySelectorAll('.level').forEach(el => {
          el.classList.remove('selected');
          el.setAttribute('aria-pressed', 'false');
        });
        g.classList.add('selected');
        g.setAttribute('aria-pressed', 'true');
        saveAnswer('niveau', level);
      }

      g.addEventListener('click', selectLevel);
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          selectLevel();
        }
      });

      svg.appendChild(g);
    });

    targetEl.appendChild(svg);
  }

  const answers = getAnswers();

  if (answers.sexe === 'femme'){
    renderPyramid(container, levelsFemme11, 'Pyramide des niveaux (foot à 11), de D5F à L1');
    const col2 = document.getElementById('pyramid-2-col');
    if (container2 && col2){
      col2.style.display = '';
      renderPyramid(container2, levelsFemme8, 'Pyramide des niveaux (foot à 8), de D5F à D1F');
    }
  } else {
    renderPyramid(container, levelsHomme, 'Pyramide des niveaux, de D8 à L1');
  }

  const validerLink = document.getElementById('valider-niveau');
  const pyramidRow = document.querySelector('.pyramid-row');

  if (validerLink){
    validerLink.addEventListener('click', (e) => {
      const selected = document.querySelector('.level.selected'); // n'importe où sur la page : une des deux pyramides suffit

      if (!selected){
        e.preventDefault();
        if (pyramidRow){
          pyramidRow.classList.remove('shake-error');
          void pyramidRow.offsetWidth;
          pyramidRow.classList.add('shake-error');
        }
        return;
      }
      // saveAnswer a déjà été fait dans selectLevel au moment du clic sur la marche
    });
  }
});

// ---------- Logique de la page Matériel (choix d'une option) ----------
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('material-grid');
  if (!grid) return;

  const options = grid.querySelectorAll('.material-option');

  function selectOption(option) {
    options.forEach(el => {
      el.classList.remove('selected');
      el.setAttribute('aria-pressed', 'false');
    });
    option.classList.add('selected');
    option.setAttribute('aria-pressed', 'true');
  }

  options.forEach(option => {
    option.setAttribute('aria-pressed', 'false');
    option.addEventListener('click', () => selectOption(option));
    option.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectOption(option);
      }
    });
  });

  const validerLink = document.getElementById('valider-materiel');
  if (validerLink){
    validerLink.addEventListener('click', (e) => {
      const selected = grid.querySelector('.material-option.selected');

      if (!selected){
        e.preventDefault(); // on bloque la navigation
        grid.classList.remove('shake-error');
        void grid.offsetWidth; // force le navigateur à "oublier" l'animation précédente
        grid.classList.add('shake-error');
        return;
      }

      saveAnswer('materiel', selected.dataset.material);
      // pas de e.preventDefault() : le lien navigue normalement vers poste.html
    });
  }
});


// ---------- Logique de la page Poste (terrain cliquable) ----------
document.addEventListener('DOMContentLoaded', () => {
  const pitch = document.getElementById('pitch');
  const currentLabel = document.getElementById('poste-current');
  if (!pitch) return; // pas sur la page poste

  const markers = pitch.querySelectorAll('.poste-marker');

  function selectMarker(marker){
    markers.forEach(el => {
      el.classList.remove('selected');
      el.setAttribute('aria-pressed', 'false');
    });
    marker.classList.add('selected');
    marker.setAttribute('aria-pressed', 'true');

    const label = marker.getAttribute('aria-label');
    if (currentLabel) {
      currentLabel.innerHTML = 'Poste sélectionné : <strong>' + label + '</strong>';
    }
    saveAnswer('poste', marker.dataset.poste);
  }

  markers.forEach(marker => {
    marker.addEventListener('click', () => selectMarker(marker));
    marker.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        selectMarker(marker);
      }
    });
  });

  const validerLink = document.getElementById('valider-poste');

  if (validerLink){
    validerLink.addEventListener('click', (e) => {
      const selected = pitch.querySelector('.poste-marker.selected');

      if (!selected){
        e.preventDefault();
        if (pitch){
          pitch.classList.remove('shake-error');
          void pitch.offsetWidth;
          pitch.classList.add('shake-error');
        }
        return;
      }
    });
  }
});


// ---------- Logique de la page Target (filtrage par poste + choix du joueur) ----------
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('player-grid');
  if (!grid || typeof PLAYERS_BY_CATEGORY === 'undefined') return; // pas sur la page target

  const postes = [
    { slug: 'gardien', label: 'Gardien', category: 'gardien' },
    { slug: 'lateral', label: 'Latéral', category: 'lateral' },
    { slug: 'defenseur-central', label: 'Défenseur central', category: 'defenseur' },
    { slug: 'milieu', label: 'Milieu', category: 'milieu' },
    { slug: 'ailier', label: 'Ailier', category: 'ailier' },
    { slug: 'buteur', label: 'Buteur', category: 'buteur' }
  ];

  function renderCategory(slug){
    const poste = postes.find(p => p.slug === slug) || postes[0];
    const players = PLAYERS_BY_CATEGORY[poste.category] || [];
    grid.innerHTML = '';

    players.forEach(([name, qualities]) => {
      const card = document.createElement('div');
      card.className = 'player-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-pressed', 'false');

      const title = document.createElement('h3');
      title.textContent = name;
      card.appendChild(title);

      const tags = document.createElement('div');
      tags.className = 'tags';
      qualities.forEach(q => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = q;
        tags.appendChild(tag);
      });
      card.appendChild(tags);

      function selectCard(){
        grid.querySelectorAll('.player-card').forEach(el => {
          el.classList.remove('selected');
          el.setAttribute('aria-pressed', 'false');
        });
        card.classList.add('selected');
        card.setAttribute('aria-pressed', 'true');
        saveAnswer('target', name);
      }

      card.addEventListener('click', selectCard);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          selectCard();
        }
      });

      grid.appendChild(card);
    });
  }

  const savedPoste = getAnswers().poste;
  renderCategory(savedPoste || postes[0].slug);
    const validerLink = document.getElementById('valider-target');

  if (validerLink){
    validerLink.addEventListener('click', (e) => {
      const selected = grid.querySelector('.player-card.selected');

      if (!selected){
        e.preventDefault(); // on bloque la navigation
        grid.classList.remove('shake-error');
        void grid.offsetWidth; // force le reflow pour pouvoir rejouer l'animation
        grid.classList.add('shake-error');
      }
      // si un joueur est sélectionné, saveAnswer('target', ...) a déjà été fait dans selectCard
    });
  }
});



// ---------- Logique de la page Infos perso ----------
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('infos-form');
  const validerLink = document.getElementById('valider-infos');
  if (!form || !validerLink) return; // pas sur la page infos

  form.addEventListener('submit', (e) => e.preventDefault());

  validerLink.addEventListener('click', (e) => {
    const prenom = document.getElementById('prenom').value.trim();
    const nom = document.getElementById('nom').value.trim();
    const email = document.getElementById('email').value.trim();
    const naissance = document.getElementById('naissance').value;
    const sexeInput = form.querySelector('input[name="sexe"]:checked');

    if (!prenom || !nom || !email || !naissance || !sexeInput){
      e.preventDefault(); // on bloque la navigation tant que ce n'est pas complet
      form.classList.remove('shake-error');
      void form.offsetWidth; // force le reflow pour pouvoir rejouer l'animation
      form.classList.add('shake-error');
      return;
    }

    saveAnswer('prenom', prenom);
    saveAnswer('nom', nom);
    saveAnswer('email', email);
    saveAnswer('naissance', naissance);
    saveAnswer('sexe', sexeInput.value); // 'femme' / 'homme' / 'autre'
    // pas de e.preventDefault() ici : le lien navigue normalement vers niveau.html
  });
});



// ---------- Logique de la page Fréquence ----------
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('frequence-grid');
  if (!grid) return; // pas sur la page fréquence

  const cards = grid.querySelectorAll('.material-option');

  function selectCard(card){
    cards.forEach(el => {
      el.classList.remove('selected');
      el.setAttribute('aria-pressed', 'false');
    });
    card.classList.add('selected');
    card.setAttribute('aria-pressed', 'true');
  }

  cards.forEach(card => {
    card.setAttribute('aria-pressed', 'false');
    card.addEventListener('click', () => selectCard(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        selectCard(card);
      }
    });
  });

  const validerLink = document.getElementById('valider-frequence');
  if (validerLink){
    validerLink.addEventListener('click', (e) => {
      const selected = grid.querySelector('.material-option.selected');

      if (!selected){
        e.preventDefault();
        grid.classList.remove('shake-error');
        void grid.offsetWidth;
        grid.classList.add('shake-error');
        return;
      }

      saveAnswer('frequence', selected.dataset.frequence);
      // pas de e.preventDefault() : le lien navigue normalement vers pp.html
    });
  }
});



// ---------- Logique de la page Préparation physique (choix d'une option) ----------
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('pp-grid');
  if (!grid) return; // pas sur la page pp

  const options = grid.querySelectorAll('.material-option');

  function selectOption(option){
    options.forEach(el => {
      el.classList.remove('selected');
      el.setAttribute('aria-pressed', 'false');
    });
    option.classList.add('selected');
    option.setAttribute('aria-pressed', 'true');
  }

  options.forEach(option => {
    option.setAttribute('aria-pressed', 'false');
    option.addEventListener('click', () => selectOption(option));
    option.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        selectOption(option);
      }
    });
  });

  const validerLink = document.getElementById('valider-pp');
  if (validerLink){
    validerLink.addEventListener('click', (e) => {
      const selected = grid.querySelector('.material-option.selected');

      if (!selected){
        e.preventDefault();
        grid.classList.remove('shake-error');
        void grid.offsetWidth;
        grid.classList.add('shake-error');
        return;
      }

      saveAnswer('pp', selected.dataset.material);
      // pas de e.preventDefault() : le lien navigue normalement vers index.html
    });
  }
});





// ---------- Logique de la page Blessures ----------
document.addEventListener('DOMContentLoaded', () => {
  const frontDiagram = document.getElementById('body-front');
  const backDiagram = document.getElementById('body-back');
  if (!frontDiagram || !backDiagram) return; // pas sur la page blessures

  const panel = document.getElementById('injury-panel');
  const panelZone = document.getElementById('injury-panel-zone');
  const panelInput = document.getElementById('injury-detail');
  const panelAddBtn = document.getElementById('injury-add-btn');
  const list = document.getElementById('injury-list');
  const autreBtn = document.getElementById('autre-btn');

  // Positions en % (top/left) — à ajuster si un point ne tombe pas pile sur l'articulation
  const MARKERS_FRONT = [
    { label: 'Tête', top: 5, left: 50 },
    { label: 'Épaule droite', top: 21, left: 33 },
    { label: 'Épaule gauche', top: 21, left: 67 },
    { label: 'Sternum', top: 27, left: 50 },
    { label: 'Bras droit', top: 35, left: 26 },
    { label: 'Bras gauche', top: 35, left: 74 },
    { label: 'Poignet/Main droit', top: 46, left: 12 },
    { label: 'Poignet/Main gauche', top: 46, left: 88 },
    { label: 'Sangle abdominale', top: 40, left: 50 },
    { label: 'Hanche droite', top: 47, left: 44 },
    { label: 'Hanche gauche', top: 47, left: 56 },
    { label: 'Cuisse droite', top: 58, left: 42 },
    { label: 'Cuisse gauche', top: 58, left: 58 },
    { label: 'Genou droit', top: 71.8, left: 42 },
    { label: 'Genou gauche', top: 71.8, left: 58 },
    { label: 'Cheville/Pied droite', top: 93, left: 41 },
    { label: 'Cheville/Pied gauche', top: 93, left: 59 }
  ];

  // Vu de dos : gauche/droite anatomiques sont inversées à l'écran par rapport à la vue de face
  const MARKERS_BACK = [
    { label: 'Cervicales', top: 15, left: 50 },
    { label: 'Coiffe droite', top: 21, left: 60 },
    { label: 'Coiffe gauche', top: 21, left: 40 },
    { label: 'Colonne vertébrale', top: 28, left: 50 },
    { label: 'Dos-Lombaire', top: 40, left: 50 },
    { label: 'Coude droit', top: 35, left: 74 },
    { label: 'Coude gauche', top: 35, left: 26 },

    { label: 'Fessier droit', top: 49, left: 58 },
    { label: 'Fessier gauche', top: 49, left: 42 },
    { label: 'Ischio droit', top: 62, left: 59 },
    { label: 'Ischio gauche', top: 62, left: 41 },
    { label: 'Mollet droit', top: 76, left: 59 },
    { label: 'Mollet gauche', top: 76, left: 41 },
    { label: 'Talon droite', top: 93, left: 58 },
    { label: 'Talon gauche', top: 93, left: 42 }
  ];

  let currentZone = null;
  const blessures = []; // { zone, detail }

  function renderMarkers(diagram, markers){
    markers.forEach(m => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'body-marker';
      btn.style.top = m.top + '%';
      btn.style.left = m.left + '%';
      btn.dataset.label = m.label;
      btn.setAttribute('aria-label', m.label);
      btn.addEventListener('click', () => openPanel(m.label));
      diagram.appendChild(btn);
    });
  }

  function openPanel(zoneLabel){
    currentZone = zoneLabel;
    panelZone.textContent = 'Zone : ' + zoneLabel;
    panelInput.value = '';
    panelInput.placeholder = 'Précisions (ex: entorse, tendinite...)';
    panel.style.display = '';
    panelInput.focus();
  }

  function markLogged(zoneLabel){
    document.querySelectorAll('.body-marker').forEach(m => {
      if (m.dataset.label === zoneLabel) m.classList.add('logged');
    });
  }

  function renderList(){
    list.innerHTML = '';
    blessures.forEach((b, i) => {
      const chip = document.createElement('div');
      chip.className = 'injury-chip';

      const text = document.createElement('span');
      text.textContent = b.zone + ' — ' + b.detail;
      chip.appendChild(text);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = '×';
      removeBtn.setAttribute('aria-label', 'Supprimer cette blessure');
      removeBtn.addEventListener('click', () => {
        blessures.splice(i, 1);
        renderList();
      });
      chip.appendChild(removeBtn);

      list.appendChild(chip);
    });
  }

  panelAddBtn.addEventListener('click', () => {
    const detail = panelInput.value.trim();
    if (!detail || !currentZone) return;
    blessures.push({ zone: currentZone, detail });
    markLogged(currentZone);
    renderList();
    panel.style.display = 'none';
    currentZone = null;
  });

  panelInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){
      e.preventDefault();
      panelAddBtn.click();
    }
  });

  autreBtn.addEventListener('click', () => {
    currentZone = 'Autre';
    panelZone.textContent = 'Zone : Autre';
    panelInput.value = '';
    panelInput.placeholder = 'Précise';
    panel.style.display = '';
    panelInput.focus();
  });

  renderMarkers(frontDiagram, MARKERS_FRONT);
  renderMarkers(backDiagram, MARKERS_BACK);

  const validerLink = document.getElementById('valider-blessures');
  if (validerLink){
    validerLink.addEventListener('click', () => {
      const summary = blessures.length
        ? blessures.map(b => b.zone + ': ' + b.detail).join(' | ')
        : 'aucune';
      saveAnswer('blessures', summary);
      // pas de e.preventDefault() : navigation normale, blessures optionnel
    });
  }
});



// ---------- Logique de la page finale (radar + aperçu semaine 1) ----------
function computeQualities(){
  const a = getAnswers();
  const groupKey = PLAYER_TO_GROUP[a.target] || DEFAULT_RADAR_GROUP;
  const groupValues = RADAR_GROUPS[groupKey] || RADAR_GROUPS[DEFAULT_RADAR_GROUP];

  const values = RADAR_AXES.map(axis => groupValues[axis] ?? 50);
  return { axes: RADAR_AXES, values };
}

function renderRadar(){
  const canvas = document.getElementById('qualities-radar');
  if (!canvas || typeof Chart === 'undefined') return;

  const { axes, values } = computeQualities();

  new Chart(canvas, {
    type: 'radar',
    data: {
      labels: axes,
      datasets: [{
        label: 'Ton profil cible',
        data: values,
        backgroundColor: 'rgba(47, 93, 83, 0.25)',
        borderColor: '#2F5D53',
        pointBackgroundColor: '#2F5D53'
      }]
    },
    options: {
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { display: false },
          grid: { color: '#CFC9B8' },
          angleLines: { color: '#CFC9B8' },
          pointLabels: { color: '#23262A', font: { size: 13 } }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function renderWeekPreview(){
  const container = document.getElementById('week-preview');
  if (!container) return;

  const answers = getAnswers();
  const planningRaw = answers.planning;
  const frequence = parseInt(answers.frequence) || 3;

  if (!planningRaw || planningRaw === 'vide'){
    container.innerHTML = '<p class="week-preview-empty">Ton planning n\'a pas encore été renseigné.</p>';
    return;
  }

  // Jours où il s'entraîne en club
  const clubDays = planningRaw.split(',').map(part => part.split(':')[0].trim());

  // Tous les jours de la semaine
  const ALL_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // Jours disponibles = ceux qui ne sont PAS des jours de club
  const availableDays = ALL_DAYS.filter(d => !clubDays.includes(d));

  // On limite au nombre de séances choisies (fréquence)
  const sessionDays = availableDays.slice(0, frequence);

  if (sessionDays.length === 0){
    container.innerHTML = '<p class="week-preview-empty">Aucun jour disponible pour les séances.</p>';
    return;
  }

  const { axes, values } = computeQualities();
  const ranked = axes
    .map((axis, i) => ({ axis, score: values[i] }))
    .sort((a, b) => b.score - a.score);

  const EXOS = {
    Vitesse:   'Sprints Vmax 3x20m + sled push @50% PDC 3x15m',
    Force:     'Squats + Développé couché 5x5 linéaire @80-85% 3min rest',
    Endurance: 'Endurance spécifique au poste',
    Puissance: '3x Squat lourd 3RM + 3x Box jump + 5x Jump squat BD @15% PDC + 3x Broad Jump',
    Agilité:   'Curve Sprint 6x20 récup complète + Poggo jump',
    Gainage:   'Palof press 4x8 /coté + KB plank 4x10'
  };

  sessionDays.forEach((day, i) => {
    const card = document.createElement('div');
    card.className = 'week-preview-card';

    const title = document.createElement('h3');
    title.textContent = day;
    card.appendChild(title);

    if (i === 0){
      [ranked[0].axis, ranked[1].axis].forEach(axis => {
        const p = document.createElement('p');
        p.textContent = EXOS[axis];
        card.appendChild(p);
      });
    } else {
      card.classList.add('locked');
      const lock = document.createElement('div');
      lock.className = 'lock-overlay';
      lock.innerHTML = '🔒<span>Débloque pour voir le détail</span>';
      card.appendChild(lock);
    }

    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderRadar();
  renderWeekPreview();
});





// ========== LOADER ==========
(function () {
  // 👇 Tes 4 étapes personnalisables
  const steps = [
    { text: "Analyse de ton profil…",        duration: 1400 },
    { text: "Construction du programme…",    duration: 2200 },
    { text: "Sélection des exercices…",      duration: 900  },
    { text: "Finalisation de ta semaine…",   duration: 1700 },
  ];

  const container = document.getElementById("loader-steps");
  const overlay   = document.getElementById("loader-overlay");

  function createLine(text) {
    const line = document.createElement("div");
    line.className = "loader-line";
    line.innerHTML = `
      <span class="line-spinner"></span>
      <span>${text}</span>
    `;
    container.appendChild(line);
    // Déclenche l'apparition
    requestAnimationFrame(() => requestAnimationFrame(() => line.classList.add("visible")));
    return line;
  }

  function finishLine(line) {
    line.classList.add("done");
    line.querySelector(".line-spinner").outerHTML = `
      <svg class="line-check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="2.5,8 6.5,12 13.5,4"/>
      </svg>
    `;
  }

  function runSteps(i) {
    if (i >= steps.length) {
      // Toutes les étapes finies → fondu
      setTimeout(() => {
        overlay.classList.add("fade-out");
        setTimeout(() => overlay.remove(), 650);
      }, 400);
      return;
    }

    const line = createLine(steps[i].text);

    setTimeout(() => {
      finishLine(line);
      setTimeout(() => runSteps(i + 1), 300);
    }, steps[i].duration);
  }

  runSteps(0);
})();