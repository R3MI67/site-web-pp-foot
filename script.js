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
});

// ---------- Logique de la page Niveau (pyramide cliquable) ----------
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pyramid');
  const currentLabel = document.getElementById('level-current');
  if (!container) return; // pas sur la page niveau

  // Du plus haut niveau (pointe) au plus bas (base)
  const levels = ['L1', 'L2', 'L3', 'N2', 'N3', 'R1', 'R2', 'R3', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'];

  const svgNS = 'http://www.w3.org/2000/svg';
  const width = 640;
  const rowHeight = 32; // 32
  const height = levels.length * rowHeight;
  const minWidth = 0;    // largeur de la pointe (L1)
  const maxWidth = 600;  // largeur de la base (D8)

  const colorTop = [47, 93, 83];    // teal (--teal), niveaux élevés
  const colorBottom = [225, 221, 208]; // ton clair, niveaux amateurs

  function lerp(a, b, t){ return Math.round(a + (b - a) * t); }
  function rowColor(t){
    const r = lerp(colorBottom[0], colorTop[0], t);
    const g = lerp(colorBottom[1], colorTop[1], t);
    const b = lerp(colorBottom[2], colorTop[2], t);
    return `rgb(${r},${g},${b})`;
  }

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('role', 'group');
  svg.setAttribute('aria-label', 'Pyramide des niveaux, de D8 à L1');

  levels.forEach((level, i) => {
    const t = i / (levels.length - 1); // sert uniquement pour la couleur, ne touche pas à ça
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

    const polygon = document.createElementNS(svgNS, 'polygon');
    polygon.setAttribute('points', `${xTopLeft},${yTop} ${xTopRight},${yTop} ${xBottomRight},${yBottom} ${xBottomLeft},${yBottom}`);
    polygon.setAttribute('fill', rowColor(t));
    g.appendChild(polygon);

    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', width / 2);
    text.setAttribute('y', (yTop + yBottom) / 2 + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', t > 0.45 ? '#FBFAF6' : '#23262A');
    text.textContent = level;
    g.appendChild(text);

    function selectLevel(){
      container.querySelectorAll('.level').forEach(el => {
        el.classList.remove('selected');
        el.setAttribute('aria-pressed', 'false');
      });
      g.classList.add('selected');
      g.setAttribute('aria-pressed', 'true');
      currentLabel.innerHTML = '<strong>' + level + '</strong>' + ' - ' + 'Valider';
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

  container.appendChild(svg);
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
    currentLabel.innerHTML = 'Poste sélectionné : <strong>' + label + '</strong>';
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
});


// ---------- Logique de la page Target (filtrage par poste + choix du joueur) ----------
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('player-grid');
  if (!grid || typeof PLAYERS_BY_CATEGORY === 'undefined') return; // pas sur la page target
 
  const select = document.getElementById('poste-select');
  const categoryTitle = document.getElementById('category-title');
 
  // Postes possibles (mêmes libellés que la page Poste) et leur catégorie de données
  const postes = [
    { slug: 'gardien', label: 'Gardien', category: 'gardien' },
    { slug: 'lateral', label: 'Latéral', category: 'lateraux' },
    { slug: 'defenseur-central', label: 'Défenseur central', category: 'defenseurs' },
    { slug: 'milieu', label: 'Milieu', category: 'milieux' },
    { slug: 'ailier', label: 'Ailier', category: 'ailiers' },
    { slug: 'buteur', label: 'Buteur', category: 'buteurs' }
  ];
 
  postes.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.slug;
    opt.textContent = p.label;
    select.appendChild(opt);
  });
 
  function renderCategory(slug){
    const poste = postes.find(p => p.slug === slug) || postes[0];
    select.value = poste.slug;
    categoryTitle.textContent = 'Poste : ' + poste.label;
 
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
 
  select.addEventListener('change', () => renderCategory(select.value));
 
  // Poste transmis par la page précédente via ?poste=...
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('poste');
  renderCategory(fromUrl || postes[0].slug);
});



// ---------- Logique de la page Infos perso ----------
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('infos-form');
  if (!form) return; // pas sur la page infos
 
  const currentLabel = document.getElementById('infos-current');
  const validateBtn = document.getElementById('validate-btn');
 
  form.addEventListener('submit', (e) => e.preventDefault());
 
  validateBtn.addEventListener('click', () => {
    const prenom = document.getElementById('prenom').value.trim();
    const nom = document.getElementById('nom').value.trim();
    const email = document.getElementById('email').value.trim();
    const naissance = document.getElementById('naissance').value;
    const sexeInput = form.querySelector('input[name="sexe"]:checked');
 
    if (!prenom || !nom || !email || !naissance || !sexeInput){
      currentLabel.textContent = 'Remplis tous les champs avant de valider.';
      return;
    }
 
    const idx = currentStepIndex();
    const params = new URLSearchParams(window.location.search);
    params.set('prenom', prenom);
    params.set('nom', nom);
    params.set('email', email);
    params.set('naissance', naissance);
    params.set('sexe', sexeInput.value);
 
    currentLabel.innerHTML = prenom + ' ' + nom + ' validé ✓';
    validateBtn.disabled = true;
 
    setTimeout(() => {
      if (idx > -1 && idx + 1 < STEPS.length){
        window.location.href = STEPS[idx + 1].file + '?' + params.toString();
      } else {
        window.location.href = 'index.html';
      }
    }, 700);
  });
});
 