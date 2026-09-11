// Reusable floating-window manager shared by every mini-window of Micro-Dixie
// (Historique today; fiche utilisateur, détail utilisateur, aide, chatbot, comparateur later).
// Consumer contract: registerWindow({ id, panel, title, badge, minimizeBtn?, closeBtn?, defaultWidth?, defaultHeight? })
// where `panel` follows the shared template: .floating-panel > .floating-header (.floating-minimize/.floating-close) + .floating-body
window.MicroDixieWindows = (function () {
  const EDGE_MARGIN = 16;
  const CASCADE_OFFSET = 28;
  const CASCADE_STEPS = 6;
  let cascadeStep = 0;
  let topZIndex = 1320;
  const registry = {};

  function createDockItem(entry) {
    const dock = document.getElementById('windowDock');
    if (!dock) return null;

    const item = document.createElement('div');
    item.className = 'dock-item';
    item.hidden = true;
    item.dataset.windowId = entry.id;

    const dot = document.createElement('span');
    dot.className = 'dock-dot';
    dot.title = 'Fenêtre active minimisée';
    dot.setAttribute('aria-label', 'Fenêtre active minimisée');
    item.appendChild(dot);

    const titleEl = document.createElement('span');
    titleEl.className = 'dock-title';
    titleEl.textContent = entry.title;
    item.appendChild(titleEl);

    if (entry.badge) {
      const badgeEl = document.createElement('span');
      badgeEl.className = 'dock-badge ' + (entry.badgeClassName || 'version-badge');
      badgeEl.textContent = entry.badge;
      item.appendChild(badgeEl);
    }

    const restoreBtn = document.createElement('button');
    restoreBtn.type = 'button';
    restoreBtn.className = 'dock-btn';
    restoreBtn.setAttribute('aria-label', 'Restaurer ' + entry.title);
    restoreBtn.textContent = '+';
    restoreBtn.addEventListener('click', function () { restoreWindow(entry.id); });
    item.appendChild(restoreBtn);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'dock-btn';
    closeBtn.setAttribute('aria-label', 'Fermer ' + entry.title);
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', function () { requestClose(entry.id); });
    item.appendChild(closeBtn);

    dock.appendChild(item);
    return item;
  }

  // Drag: only via the header bar (never from control buttons), keeps the window within the viewport
  function enableDrag(entry) {
    if (!entry.panel || !entry.header) return;
    let dragging = false;
    let pointerStartX = 0, pointerStartY = 0;
    let panelStartLeft = 0, panelStartTop = 0;

    function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
    function pointerPos(e) { const t = e.touches && e.touches[0]; return { x: t ? t.clientX : e.clientX, y: t ? t.clientY : e.clientY }; }

    function startDrag(e) {
      if (e.target.closest('.floating-btn')) return;
      const pos = pointerPos(e);
      const rect = entry.panel.getBoundingClientRect();
      entry.panel.style.right = 'auto';
      entry.panel.style.bottom = 'auto';
      entry.panel.style.left = rect.left + 'px';
      entry.panel.style.top = rect.top + 'px';
      panelStartLeft = rect.left;
      panelStartTop = rect.top;
      pointerStartX = pos.x;
      pointerStartY = pos.y;
      dragging = true;
      document.body.style.userSelect = 'none';
      e.preventDefault();
    }

    function moveDrag(e) {
      if (!dragging) return;
      const pos = pointerPos(e);
      const panelW = entry.panel.offsetWidth;
      const panelH = entry.panel.offsetHeight;
      const maxLeft = Math.max(EDGE_MARGIN, window.innerWidth - panelW - EDGE_MARGIN);
      const maxTop = Math.max(EDGE_MARGIN, window.innerHeight - panelH - EDGE_MARGIN);
      const newLeft = clamp(panelStartLeft + (pos.x - pointerStartX), EDGE_MARGIN, maxLeft);
      const newTop = clamp(panelStartTop + (pos.y - pointerStartY), EDGE_MARGIN, maxTop);
      entry.panel.style.left = newLeft + 'px';
      entry.panel.style.top = newTop + 'px';
      e.preventDefault();
    }

    function stopDrag() {
      if (!dragging) return;
      dragging = false;
      document.body.style.userSelect = '';
    }

    entry.header.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', stopDrag);
    entry.header.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', moveDrag, { passive: false });
    document.addEventListener('touchend', stopDrag);
  }

  function registerWindow(config) {
    const panel = config && config.panel;
    if (!panel || !config.id) return null;

    const entry = {
      id: config.id,
      panel: panel,
      header: panel.querySelector('.floating-header'),
      minimizeBtn: config.minimizeBtn || panel.querySelector('.floating-minimize'),
      closeBtn: config.closeBtn || panel.querySelector('.floating-close'),
      title: config.title || '',
      badge: config.badge || '',
      badgeClassName: config.badgeClassName || '',
      defaultWidth: config.defaultWidth || 580,
      defaultHeight: config.defaultHeight || 480,
      savedWidth: config.defaultWidth || 580,
      savedHeight: config.defaultHeight || 480,
      // optional veto hook: return false to keep the window open (e.g. unsaved changes)
      onBeforeClose: typeof config.onBeforeClose === 'function' ? config.onBeforeClose : null,
      dockItem: null
    };

    entry.dockItem = createDockItem(entry);
    if (entry.minimizeBtn) entry.minimizeBtn.addEventListener('click', function () { minimizeWindow(entry.id); });
    if (entry.closeBtn) entry.closeBtn.addEventListener('click', function () { requestClose(entry.id); });
    // clicking or starting a drag anywhere on the window brings it to front
    entry.panel.addEventListener('mousedown', function () { bringWindowToFront(entry.id); });
    entry.panel.addEventListener('touchstart', function () { bringWindowToFront(entry.id); }, { passive: true });
    enableDrag(entry);

    registry[entry.id] = entry;
    return entry;
  }

  function bringWindowToFront(id) {
    const entry = registry[id];
    if (!entry || !entry.panel) return;
    topZIndex += 1;
    entry.panel.style.zIndex = String(topZIndex);
  }

  function openWindow(id) {
    const entry = registry[id];
    if (!entry || !entry.panel) return;
    entry.panel.hidden = false;
    entry.panel.classList.remove('minimized');
    entry.panel.style.width = entry.savedWidth + 'px';
    entry.panel.style.height = entry.savedHeight + 'px';
    entry.panel.style.resize = 'both';
    entry.panel.setAttribute('aria-expanded', 'true');
    if (entry.dockItem) entry.dockItem.hidden = true;
    // Cascades freshly opened windows (never dragged since) so several fiches never sit exactly on top of one another;
    // the very first window keeps the CSS-anchored default position (right/bottom) so it stays responsive on resize
    if (cascadeStep > 0 && !entry.panel.style.left && !entry.panel.style.top) {
      const offset = (cascadeStep % CASCADE_STEPS) * CASCADE_OFFSET;
      const baseLeft = window.innerWidth - entry.panel.offsetWidth - 24;
      const baseTop = window.innerHeight - entry.panel.offsetHeight - 24;
      entry.panel.style.right = 'auto';
      entry.panel.style.bottom = 'auto';
      entry.panel.style.left = Math.max(EDGE_MARGIN, baseLeft - offset) + 'px';
      entry.panel.style.top = Math.max(EDGE_MARGIN, baseTop - offset) + 'px';
    }
    cascadeStep += 1;
    bringWindowToFront(id);
  }

  function closeWindow(id) {
    const entry = registry[id];
    if (!entry || !entry.panel) return;
    entry.panel.hidden = true;
    entry.panel.classList.remove('minimized');
    entry.panel.setAttribute('aria-expanded', 'false');
    if (entry.dockItem) entry.dockItem.hidden = true;
    // reset to stylesheet defaults so the window always reopens in a clean state
    ['left', 'top', 'right', 'bottom', 'width', 'height'].forEach(function (prop) { entry.panel.style[prop] = ''; });
    entry.savedWidth = entry.defaultWidth;
    entry.savedHeight = entry.defaultHeight;
  }

  // Closes the window unless its onBeforeClose hook returns false (e.g. unsaved changes)
  function requestClose(id) {
    const entry = registry[id];
    if (!entry) return;
    if (entry.onBeforeClose && entry.onBeforeClose(id) === false) return;
    closeWindow(id);
  }

  function minimizeWindow(id) {
    const entry = registry[id];
    if (!entry || !entry.panel) return;
    entry.savedWidth = entry.panel.offsetWidth || entry.defaultWidth;
    entry.savedHeight = entry.panel.offsetHeight || entry.defaultHeight;
    entry.panel.hidden = true;
    entry.panel.classList.add('minimized');
    entry.panel.setAttribute('aria-expanded', 'false');
    if (entry.dockItem) entry.dockItem.hidden = false;
  }

  function restoreWindow(id) {
    const entry = registry[id];
    if (!entry || !entry.panel) return;
    entry.panel.hidden = false;
    entry.panel.classList.remove('minimized');
    entry.panel.style.width = entry.savedWidth + 'px';
    entry.panel.style.height = entry.savedHeight + 'px';
    entry.panel.style.resize = 'both';
    entry.panel.setAttribute('aria-expanded', 'true');
    if (entry.dockItem) entry.dockItem.hidden = true;
    bringWindowToFront(id);
  }

  function isOpen(id) {
    const entry = registry[id];
    return !!(entry && entry.panel && !entry.panel.hidden);
  }

  function isMinimized(id) {
    const entry = registry[id];
    return !!(entry && entry.dockItem && !entry.dockItem.hidden);
  }

  // Keeps explicitly-positioned windows (dragged or cascaded) inside the viewport after a resize
  window.addEventListener('resize', function () {
    Object.keys(registry).forEach(function (id) {
      const entry = registry[id];
      if (!entry.panel || entry.panel.hidden || !entry.panel.style.left) return;
      const maxLeft = Math.max(EDGE_MARGIN, window.innerWidth - entry.panel.offsetWidth - EDGE_MARGIN);
      const maxTop = Math.max(EDGE_MARGIN, window.innerHeight - entry.panel.offsetHeight - EDGE_MARGIN);
      entry.panel.style.left = Math.min(parseFloat(entry.panel.style.left) || 0, maxLeft) + 'px';
      entry.panel.style.top = Math.min(parseFloat(entry.panel.style.top) || 0, maxTop) + 'px';
    });
  });

  // Refreshes a window's title/badge everywhere it appears (dock entry), e.g. after saving edited data
  function updateWindowMeta(id, meta) {
    const entry = registry[id];
    if (!entry || !meta) return;
    if (typeof meta.title === 'string') {
      entry.title = meta.title;
      const titleEl = entry.dockItem && entry.dockItem.querySelector('.dock-title');
      if (titleEl) titleEl.textContent = meta.title;
    }
    if (typeof meta.badge === 'string') {
      entry.badge = meta.badge;
      if (typeof meta.badgeClassName === 'string') entry.badgeClassName = meta.badgeClassName;
      if (entry.dockItem) {
        let badgeEl = entry.dockItem.querySelector('.dock-badge');
        if (!badgeEl && meta.badge) {
          badgeEl = document.createElement('span');
          entry.dockItem.insertBefore(badgeEl, entry.dockItem.querySelector('.dock-btn'));
        }
        if (badgeEl) {
          badgeEl.className = 'dock-badge ' + (entry.badgeClassName || 'version-badge');
          badgeEl.textContent = meta.badge;
        }
      }
    }
  }

  return {
    registerWindow: registerWindow,
    openWindow: openWindow,
    closeWindow: closeWindow,
    requestClose: requestClose,
    minimizeWindow: minimizeWindow,
    restoreWindow: restoreWindow,
    bringWindowToFront: bringWindowToFront,
    isOpen: isOpen,
    isMinimized: isMinimized,
    updateWindowMeta: updateWindowMeta
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  const STORAGE_KEY = 'microDixieUsers';
  const THEME_KEY = 'microDixieTheme';

  // Actions that also surface as a top-right toast (journal keeps logging everything regardless)
  const TOAST_ACTIONS = {
    'Utilisateur ajouté': 'success',
    'Utilisateur modifié': 'success',
    'Utilisateur supprimé': 'success',
    'Utilisateur activé': 'success',
    'Utilisateur désactivé': 'danger',
    'Charger une démo': 'success',
    'Export données tableau de bord': 'info',
    'Export tableau CSV': 'info',
    'Export CSV fiche': 'info',
    'Import JSON': 'info',
    'Vider la liste': 'danger'
  };

  // Elements
  const form = document.getElementById('userForm');
  const nameField = document.getElementById('userName');
  const emailField = document.getElementById('userEmail');
  const roleField = document.getElementById('userRole');
  const tableBody = document.getElementById('usersTableBody');
  const messageEl = document.getElementById('formMessage');
  const totalEl = document.getElementById('userTotalCount');
  const filteredEl = document.getElementById('userFilteredCount');
  const searchInput = document.getElementById('searchInput');
  const roleFilter = document.getElementById('roleFilter');
  const resetFiltersBtn = document.getElementById('resetFilters');
  const noResultsMessage = document.getElementById('noResultsMessage');

  const statTotal = document.getElementById('statTotal');
  const statAdmin = document.getElementById('statAdmin');
  const statEditor = document.getElementById('statEditor');
  const statObserver = document.getElementById('statObserver');
  const roleDonut = document.getElementById('roleDonut');
  const activityLog = document.getElementById('activityLog');
  const toastContainer = document.getElementById('toastContainer');

  const importJsonBtn = document.getElementById('importJsonBtn');
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const loadDemoBtn = document.getElementById('loadDemoBtn');
  const importFileInput = document.getElementById('importFileInput');
  const clearUsersBtn = document.getElementById('clearUsersBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const backToTopBtn = document.getElementById('backToTop');

  // User window elements (reusable floating-window template, see js/app.js MicroDixieWindows)
  const userWindowTemplate = document.getElementById('userWindowTemplate');

  const submitBtn = document.getElementById('submitBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');

  // State
  let users = [];
  let journalEntries = [];
  let editId = null;
  let nextIdCounter = 0;

  // Storage
  function loadUsers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        users = [];
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) users = parsed;
      else users = [];
      // ensure new fields and IDs
      users = users.map(u => Object.assign({ address: '', locality: '', privatePhone: '', professionalPhone: '', birthDate: '' }, u));
      users.forEach(u => { if (!u.id) u.id = generateNextId(); });
      computeNextIdCounter();
    } catch (e) {
      console.error('Erreur lecture localStorage', e);
      users = [];
    }
  }

  function saveUsers() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Erreur sauvegarde localStorage', e);
    }
  }

  // Render
  function renderUsers() {
    if (!tableBody) return;
    tableBody.innerHTML = '';
    noResultsMessage.hidden = true;

    if (!users.length) {
      createEmptyState();
      updateCount();
      return;
    }

    const filtered = getFilteredUsers();

    if (!filtered.length) {
      noResultsMessage.hidden = false;
      updateCount();
      return;
    }

    filtered.forEach(function (u) {
      const tr = document.createElement('tr');
      tr.dataset.id = u.id;

      const tdAvatar = document.createElement('td');
      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      avatar.textContent = initialsFromName(u.name || '');
      tdAvatar.appendChild(avatar);
      tr.appendChild(tdAvatar);

      const tdName = document.createElement('td');
      tdName.textContent = u.name;
      tr.appendChild(tdName);

      const tdEmail = document.createElement('td');
      tdEmail.textContent = u.email;
      tr.appendChild(tdEmail);

      const tdRole = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = 'role-badge ' + roleBadgeClass(u.role);
      badge.textContent = u.role;
      tdRole.appendChild(badge);
      tr.appendChild(tdRole);

      const tdStatus = document.createElement('td');
      const isActive = u.active !== false;
      const statusBadge = document.createElement('span');
      statusBadge.className = 'status-badge ' + (isActive ? 'status-active' : 'status-inactive');
      statusBadge.textContent = isActive ? 'Actif' : 'Inactif';
      tdStatus.appendChild(statusBadge);
      tr.appendChild(tdStatus);

      const tdActions = document.createElement('td');

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn edit';
      editBtn.textContent = 'Modifier';
      editBtn.addEventListener('click', function () { startEdit(u.id); });
      tdActions.appendChild(editBtn);

      tr.appendChild(tdActions);
      tableBody.appendChild(tr);
    });

    updateCount();
  }

  function renderStats() {
    if (!statTotal) return;
    const total = users.length;
    const admin = users.filter(u => (u.role || '').toLowerCase().includes('admin')).length;
    const editor = users.filter(u => (u.role || '').toLowerCase().includes('édit') || (u.role || '').toLowerCase().includes('edit')).length;
    const observer = users.filter(u => (u.role || '').toLowerCase().includes('observ')).length;
    bumpLegendValue(statAdmin, admin, 'admin');
    bumpLegendValue(statEditor, editor, 'editor');
    bumpLegendValue(statObserver, observer, 'observer');
    statAdmin.textContent = String(admin);
    statEditor.textContent = String(editor);
    statObserver.textContent = String(observer);
    renderRoleDonut(total, admin, editor);
  }

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // Brief scale + role-colored flash on a legend value when it actually changes, skipped under reduced motion
  const LEGEND_ROLE_COLORS = { admin: '#0b66f6', editor: '#6f42c1', observer: '#6c757d' };
  function bumpLegendValue(el, newValue, roleKey) {
    if (!el) return;
    const prev = el.dataset.value;
    el.dataset.value = String(newValue);
    if (prev === undefined || Number(prev) === newValue || prefersReducedMotion()) return;
    el.style.color = LEGEND_ROLE_COLORS[roleKey];
    el.classList.remove('legend-value-pulse');
    void el.offsetWidth; // restart the CSS animation
    el.classList.add('legend-value-pulse');
    clearTimeout(el._pulseTimer);
    el._pulseTimer = setTimeout(function () { el.classList.remove('legend-value-pulse'); el.style.color = ''; }, DONUT_ANIM_MS);
  }

  // Paints the role-distribution donut (pure CSS conic-gradient, no chart library)
  // Animated via requestAnimationFrame (CSS transitions cannot reliably interpolate conic-gradient stops across browsers)
  const DONUT_ANIM_MS = 650;
  let donutAnimFrameId = null;
  let donutCurrent = { total: 0, adminEnd: 0, editorEnd: 0 };
  let donutInitialized = false;

  function paintDonut(state) {
    if (statTotal) statTotal.textContent = String(Math.max(0, Math.round(state.total)));
    if (Math.round(state.total) <= 0) { roleDonut.style.background = 'conic-gradient(var(--border) 0 100%)'; return; }
    roleDonut.style.background = `conic-gradient(#0b66f6 0 ${state.adminEnd}%, #6f42c1 ${state.adminEnd}% ${state.editorEnd}%, #6c757d ${state.editorEnd}% 100%)`;
  }

  function renderRoleDonut(total, admin, editor) {
    if (!roleDonut) return;
    // Percentages (angles), not raw counts, are the interpolated quantity: keeps proportions stable and avoids
    // divide-by-zero jumps when total transitions to/from 0 (the counter itself animates separately, in sync).
    const targetAdminEnd = total ? (admin / total) * 100 : 0;
    const targetEditorEnd = total ? targetAdminEnd + (editor / total) * 100 : 0;
    const target = { total: total, adminEnd: targetAdminEnd, editorEnd: targetEditorEnd };

    if (donutAnimFrameId) { cancelAnimationFrame(donutAnimFrameId); donutAnimFrameId = null; }

    if (!donutInitialized || prefersReducedMotion()) {
      donutInitialized = true;
      donutCurrent = target;
      paintDonut(donutCurrent);
      return;
    }

    // Animate from whatever is currently on screen (mid-animation or settled) to the new target, avoiding jumps on rapid changes
    const from = Object.assign({}, donutCurrent);
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / DONUT_ANIM_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      donutCurrent = {
        total: from.total + (target.total - from.total) * eased,
        adminEnd: from.adminEnd + (target.adminEnd - from.adminEnd) * eased,
        editorEnd: from.editorEnd + (target.editorEnd - from.editorEnd) * eased
      };
      paintDonut(donutCurrent);
      if (t < 1) {
        donutAnimFrameId = requestAnimationFrame(step);
      } else {
        donutAnimFrameId = null;
        donutCurrent = target;
        paintDonut(donutCurrent);
      }
    }
    donutAnimFrameId = requestAnimationFrame(step);
  }


  function renderJournal() {
    if (!activityLog) return;
    activityLog.innerHTML = '';
    journalEntries.forEach(function (e) {
      const div = document.createElement('div');
      div.className = 'entry';
      div.textContent = e.text;
      activityLog.appendChild(div);
    });
  }

  // Helpers
  function initialsFromName(name) {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    return parts.slice(0,2).map(p => p.charAt(0).toUpperCase()).join('');
  }

  // Single source of truth for role -> color mapping (table, fiche utilisateur, dock)
  function roleBadgeClass(role) {
    const roleLower = (role || '').toLowerCase();
    if (roleLower.includes('admin')) return 'role-admin';
    if (roleLower.includes('édit') || roleLower.includes('edit')) return 'role-editor';
    return 'role-observer';
  }

  // Same filtering rules used by the table render and the count badge — also reused by "Exporter tableau CSV"
  function getFilteredUsers() {
    const q = (searchInput && searchInput.value || '').trim().toLowerCase();
    const role = roleFilter ? roleFilter.value : 'all';
    return users.filter(function (u) {
      const matchesRole = role === 'all' || (u.role || '') === role;
      const inText = !q || (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q));
      return matchesRole && inText;
    });
  }

  function computeNextIdCounter() {
    let max = 0;
    users.forEach(u => {
      if (u.id) {
        const m = u.id.match(/^USR-(\d+)$/);
        if (m) {
          const n = parseInt(m[1],10);
          if (n > max) max = n;
        }
      }
    });
    nextIdCounter = max;
  }

  function generateNextId() {
    nextIdCounter = Math.max(nextIdCounter, 0) + 1;
    return 'USR-' + String(nextIdCounter).padStart(4, '0');
  }

  // Actions
  function addUser(data) {
    const user = Object.assign({ id: generateNextId(), address: '', locality: '', privatePhone: '', professionalPhone: '', birthDate: '', active: true }, data);
    users.push(user);
    saveUsers();
    renderUsers();
    showMessage('Utilisateur ajouté.', 'success');
    addJournal('Utilisateur ajouté', user.name);
  }

  function updateUser(id, values) {
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return showMessage('Utilisateur introuvable.', 'error');
    users[idx] = Object.assign({}, users[idx], values);
    saveUsers();
    renderUsers();
    showMessage('Utilisateur mis à jour.', 'success');
    addJournal('Utilisateur modifié', users[idx].name);
  }

  // Removes the user from data/UI once deletion has already been confirmed and authorized
  function performUserDeletion(found) {
    users = users.filter(function (u) { return u.id !== found.id; });
    saveUsers();
    renderUsers();
    if (!users.length) createEmptyState();
    showMessage('Utilisateur supprimé.', 'success');
    addJournal('Utilisateur supprimé', found.name);
  }

  function deleteUser(id) {
    const found = users.find(function (u) { return u.id === id; });
    if (!found) { showMessage('Utilisateur introuvable.', 'error'); return; }

    // Business rule: a user's fiche window must be fully closed (not open, not minimized) before deletion
    const winId = userWindowIdFor(id);
    const blockedMessage = 'Suppression interdite : la fiche utilisateur est encore ouverte ou minimisée. Fermez d\'abord la fiche avant de supprimer cet utilisateur.';
    if (MicroDixieWindows.isOpen(winId)) {
      MicroDixieWindows.bringWindowToFront(winId);
      showMessage(blockedMessage, 'error');
      showToast(blockedMessage, 'danger');
      return;
    }
    if (MicroDixieWindows.isMinimized(winId)) {
      MicroDixieWindows.restoreWindow(winId);
      showMessage(blockedMessage, 'error');
      showToast(blockedMessage, 'danger');
      return;
    }

    const ok = window.confirm('Confirmer la suppression définitive de cet utilisateur ?');
    if (!ok) return;

    performUserDeletion(found);
  }

  function startEdit(id) {
    const found = users.find(u => u.id === id);
    if (!found) return showMessage('Utilisateur introuvable.', 'error');
    openUserWindow(id);
  }

  function cancelEdit() {
    editId = null;
    form.reset();
    if (submitBtn) submitBtn.textContent = 'Ajouter';
    if (cancelEditBtn) cancelEditBtn.style.display = 'none';
  }

  // Demo / Import / Export
  function loadDemoData() {
    const demo = [
      { name: 'Alice Martin', email: 'alice@demo.local', role: 'Administrateur', address: '12 rue de la Demo', locality: 'Bruxelles', privatePhone: '+32 400 00 00 01', professionalPhone: '+32 2 000 00 01', birthDate: '1990-01-15' },
      { name: 'Bruno Leroy', email: 'bruno@demo.local', role: 'Éditeur', address: '24 avenue Test', locality: 'Namur', privatePhone: '+32 400 00 00 02', professionalPhone: '+32 81 00 00 02', birthDate: '1988-05-22' },
      { name: 'Claire Simon', email: 'claire@demo.local', role: 'Observateur', address: '8 chemin Exemple', locality: 'Liège', privatePhone: '+32 400 00 00 03', professionalPhone: '+32 4 000 00 03', birthDate: '1992-09-10' }
    ];
    const mapped = demo.map(d => Object.assign({ id: generateNextId() }, d));
    users = users.concat(mapped);
    saveUsers();
    renderUsers();
    addJournal('Charger une démo', null);
    showMessage('Données de démonstration ajoutées.', 'success');
  }

  function exportUsers() {
    try {
      const data = users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, address: u.address || '', locality: u.locality || '', privatePhone: u.privatePhone || '', professionalPhone: u.professionalPhone || '', birthDate: u.birthDate || '' }));
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'micro-dixie-users.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      addJournal('Export données tableau de bord', `${data.length} utilisateur(s)`);
      showMessage('Export JSON téléchargé.', 'success');
    } catch (e) {
      console.error('Erreur export', e);
      showMessage('Erreur lors de l’exportation.', 'error');
    }
  }

  // CSV export (Excel-compatible: ";" separator, UTF-8 BOM, CRLF line endings), used by table + fiche exports
  const CSV_COLUMNS = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rôle' },
    { key: 'address', label: 'Adresse' },
    { key: 'locality', label: 'Localité' },
    { key: 'privatePhone', label: 'Téléphone privé' },
    { key: 'professionalPhone', label: 'Téléphone professionnel' },
    { key: 'birthDate', label: 'Date de naissance' }
  ];

  function csvEscapeField(value) {
    const str = value === null || value === undefined ? '' : String(value);
    // quote the field if it contains the separator, a quote or a line break
    if (/[";\n\r]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
    return str;
  }

  function usersToCsv(list) {
    const header = CSV_COLUMNS.map(function (c) { return csvEscapeField(c.label); }).join(';');
    const rows = list.map(function (u) {
      return CSV_COLUMNS.map(function (c) { return csvEscapeField(u[c.key] || ''); }).join(';');
    });
    return [header].concat(rows).join('\r\n');
  }

  function downloadCsv(filename, csvContent) {
    // BOM prefix so Excel detects UTF-8 and displays accents correctly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportUsersTableCsv() {
    try {
      const filtered = getFilteredUsers();
      downloadCsv('micro-dixie-utilisateurs.csv', usersToCsv(filtered));
      addJournal('Export tableau CSV', `${filtered.length} utilisateur(s)`);
      showMessage('Export CSV téléchargé.', 'success');
    } catch (e) {
      console.error('Erreur export CSV', e);
      showMessage('Erreur lors de l’exportation CSV.', 'error');
    }
  }

  function handleImportFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed)) { showMessage('Fichier JSON invalide : format tableau attendu.', 'error'); importFileInput.value = ''; return; }
        // validate required fields
        for (let i = 0; i < parsed.length; i++) {
          const it = parsed[i];
          if (!it || typeof it !== 'object') { showMessage('Fichier JSON invalide : éléments incorrects.', 'error'); importFileInput.value = ''; return; }
          if (typeof it.name !== 'string' || !it.name.trim()) { showMessage('Import annulé : chaque utilisateur doit avoir un name.', 'error'); importFileInput.value = ''; return; }
          if (typeof it.email !== 'string' || !it.email.trim()) { showMessage('Import annulé : chaque utilisateur doit avoir un email.', 'error'); importFileInput.value = ''; return; }
          if (typeof it.role !== 'string' || !it.role.trim()) { showMessage('Import annulé : chaque utilisateur doit avoir un role.', 'error'); importFileInput.value = ''; return; }
        }
        const imported = parsed.map(it => ({ id: it.id && typeof it.id === 'string' ? it.id : generateNextId(), name: String(it.name).trim(), email: String(it.email).trim(), role: String(it.role).trim(), address: String(it.address || '').trim(), locality: String(it.locality || '').trim(), privatePhone: String(it.privatePhone || '').trim(), professionalPhone: String(it.professionalPhone || '').trim(), birthDate: String(it.birthDate || '').trim() }));
        users = imported;
        saveUsers();
        renderUsers();
        addJournal('Import JSON', `${imported.length} utilisateur(s)`);
        showMessage('Importation terminée.', 'success');
      } catch (err) {
        console.error('Erreur import', err);
        showMessage('Fichier JSON invalide ou lecture impossible.', 'error');
      }
      importFileInput.value = '';
    };
    reader.readAsText(file, 'utf-8');
  }

  // User windows (fiche utilisateur) — one floating, dockable window per user, built from #userWindowTemplate.
  // Reuses MicroDixieWindows exactly like Historique: drag, resize, minimize/dock, restore, bring-to-front.
  const userWindows = {};

  function userWindowIdFor(userId) { return 'userWindow-' + userId; }

  function buildUserWindowPanel(user) {
    const fragment = userWindowTemplate.content.cloneNode(true);
    const panel = fragment.querySelector('.floating-panel');
    panel.id = userWindowIdFor(user.id);
    document.body.appendChild(panel);
    return panel;
  }

  function readUserWindowValues(record) {
    return {
      name: record.fields.name.value.trim(),
      email: record.fields.email.value.trim(),
      role: record.fields.role.value,
      address: record.fields.address.value.trim(),
      locality: record.fields.locality.value.trim(),
      privatePhone: record.fields.privatePhone.value.trim(),
      professionalPhone: record.fields.professionalPhone.value.trim(),
      birthDate: record.fields.birthDate.value
    };
  }

  function isUserWindowDirty(record) {
    const current = readUserWindowValues(record);
    const original = record.originalValues || {};
    return Object.keys(current).some(function (key) { return (current[key] || '') !== (original[key] || ''); });
  }

  function refreshDirtyIndicator(record) {
    if (record.dirtyDot) record.dirtyDot.hidden = !isUserWindowDirty(record);
  }

  function showUwFeedback(record, text) {
    if (!record.feedback) return;
    record.feedback.textContent = text;
    clearTimeout(record.feedback._t);
    record.feedback._t = setTimeout(function () { record.feedback.textContent = ''; }, 2500);
  }

  function fallbackCopyToClipboard(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    ta.remove();
  }

  function copyUserIdToClipboard(record) {
    const id = record.fields.id.value || '';
    if (!id) return;
    function done() {
      showUwFeedback(record, 'ID copié');
      addJournal('ID copié', id);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(id).then(done).catch(function () { fallbackCopyToClipboard(id); done(); });
    } else {
      fallbackCopyToClipboard(id);
      done();
    }
  }

  function exportUserWindowCsv(record) {
    const user = users.find(function (u) { return u.id === record.userId; });
    if (!user) return;
    downloadCsv('micro-dixie-utilisateur-' + user.id + '.csv', usersToCsv([user]));
    addJournal('Export CSV fiche', user.name);
    showUwFeedback(record, 'Fiche exportée (CSV)');
  }

  function printUserWindow(record) {
    const user = users.find(function (u) { return u.id === record.userId; });
    const printArea = document.getElementById('printArea');
    if (!user || !printArea) return;

    printArea.innerHTML = '';
    function addLine(label, value) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = label + ' : ';
      p.appendChild(strong);
      p.appendChild(document.createTextNode(value || ''));
      printArea.appendChild(p);
    }
    const h2 = document.createElement('h2');
    h2.textContent = 'Fiche utilisateur — ' + (user.name || '');
    printArea.appendChild(h2);
    addLine('ID', user.id);
    addLine('Nom', user.name);
    addLine('Email', user.email);
    addLine('Rôle', user.role);
    addLine('Adresse', user.address);
    addLine('Localité', user.locality);
    addLine('Téléphone privé', user.privatePhone);
    addLine('Téléphone professionnel', user.professionalPhone);
    addLine('Date de naissance', user.birthDate);
    const note = document.createElement('p');
    note.className = 'print-note';
    note.textContent = 'Démonstration Micro-Dixie CRM — données fictives';
    printArea.appendChild(note);

    window.print();
  }

  // Refreshes a window's fields from the current user record (initial build or reopen after external changes)
  function populateUserWindow(record, user) {
    record.userId = user.id;
    record.fields.id.value = user.id || '';
    record.fields.name.value = user.name || '';
    record.fields.email.value = user.email || '';
    record.fields.role.value = user.role || '';
    record.fields.address.value = user.address || '';
    record.fields.locality.value = user.locality || '';
    record.fields.privatePhone.value = user.privatePhone || '';
    record.fields.professionalPhone.value = user.professionalPhone || '';
    record.fields.birthDate.value = user.birthDate || '';
    record.titleName.textContent = user.name || '';
    record.badge.textContent = user.role || '';
    record.badge.className = 'role-badge uw-badge ' + roleBadgeClass(user.role);
    record.avatar.textContent = initialsFromName(user.name || '');
    record.panel.setAttribute('aria-label', 'Fiche utilisateur — ' + (user.name || ''));
    if (record.toggleActiveBtn) {
      const isActive = user.active !== false;
      record.toggleActiveBtn.textContent = isActive ? 'Désactiver' : 'Activer';
      record.toggleActiveBtn.classList.toggle('btn-deactivate', isActive);
      record.toggleActiveBtn.classList.toggle('btn-activate', !isActive);
    }
    record.originalValues = readUserWindowValues(record);
    refreshDirtyIndicator(record);
  }

  function saveUserWindow(winId) {
    const record = userWindows[winId];
    if (!record) return;
    const values = readUserWindowValues(record);
    if (!values.name || !values.email || !values.role) { showMessage('Nom, email et rôle sont obligatoires.', 'error'); return; }
    updateUser(record.userId, values);
    record.originalValues = values;
    // reflect the saved data in the open window and its dock entry, keep the window open
    record.titleName.textContent = values.name;
    record.badge.textContent = values.role;
    record.badge.className = 'role-badge uw-badge ' + roleBadgeClass(values.role);
    MicroDixieWindows.updateWindowMeta(winId, { title: values.name, badge: values.role, badgeClassName: 'role-badge ' + roleBadgeClass(values.role) });
    refreshDirtyIndicator(record);
  }

  function cancelUserWindow(winId) {
    MicroDixieWindows.requestClose(winId);
  }

  // Deletion triggered from inside the fiche itself: skip the open/minimized guard (this IS that window) and force-close it
  function deleteUserFromWindow(winId, userId) {
    const found = users.find(function (u) { return u.id === userId; });
    if (!found) { showMessage('Utilisateur introuvable.', 'error'); return; }

    const ok = window.confirm('Confirmer la suppression définitive de cet utilisateur ?');
    if (!ok) return;

    MicroDixieWindows.closeWindow(winId);
    delete userWindows[winId];
    performUserDeletion(found);
  }

  // Toggles the active/inactive status of a user from within their fiche
  function toggleUserActive(winId, userId) {
    const idx = users.findIndex(function (u) { return u.id === userId; });
    if (idx === -1) { showMessage('Utilisateur introuvable.', 'error'); return; }
    const wasActive = users[idx].active !== false;
    users[idx] = Object.assign({}, users[idx], { active: !wasActive });
    saveUsers();
    renderUsers();
    const record = userWindows[winId];
    if (record) populateUserWindow(record, users[idx]);
    const label = wasActive ? 'désactivé' : 'activé';
    showMessage('Utilisateur ' + label + '.', 'success');
    addJournal(wasActive ? 'Utilisateur désactivé' : 'Utilisateur activé', users[idx].name);
  }

  function createUserWindow(user) {
    const panel = buildUserWindowPanel(user);
    const record = {
      panel: panel,
      userId: user.id,
      fields: {
        id: panel.querySelector('.uw-id'),
        name: panel.querySelector('.uw-name'),
        email: panel.querySelector('.uw-email'),
        role: panel.querySelector('.uw-role'),
        address: panel.querySelector('.uw-address'),
        locality: panel.querySelector('.uw-locality'),
        privatePhone: panel.querySelector('.uw-private-phone'),
        professionalPhone: panel.querySelector('.uw-professional-phone'),
        birthDate: panel.querySelector('.uw-birth-date')
      },
      titleName: panel.querySelector('.uw-title-name'),
      badge: panel.querySelector('.uw-badge'),
      avatar: panel.querySelector('.uw-avatar'),
      dirtyDot: panel.querySelector('.uw-dirty-dot'),
      feedback: panel.querySelector('.uw-feedback'),
      toggleActiveBtn: panel.querySelector('.uw-toggle-active'),
      originalValues: {}
    };
    record.fields.id.readOnly = true;

    const winId = userWindowIdFor(user.id);
    populateUserWindow(record, user);

    const saveBtn = panel.querySelector('.uw-save');
    const cancelBtn = panel.querySelector('.uw-cancel');
    const deleteBtn = panel.querySelector('.uw-delete');
    const toggleActiveBtn = panel.querySelector('.uw-toggle-active');
    const copyIdBtn = panel.querySelector('.uw-copy-id');
    const exportCsvBtn = panel.querySelector('.uw-export-csv');
    const printBtn = panel.querySelector('.uw-print');
    const formEl = panel.querySelector('.uw-form');
    if (saveBtn) saveBtn.addEventListener('click', function () { saveUserWindow(winId); });
    if (cancelBtn) cancelBtn.addEventListener('click', function () { cancelUserWindow(winId); });
    if (deleteBtn) deleteBtn.addEventListener('click', function () { deleteUserFromWindow(winId, record.userId); });
    if (toggleActiveBtn) toggleActiveBtn.addEventListener('click', function () { toggleUserActive(winId, record.userId); });
    if (copyIdBtn) copyIdBtn.addEventListener('click', function () { copyUserIdToClipboard(record); });
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', function () { exportUserWindowCsv(record); });
    if (printBtn) printBtn.addEventListener('click', function () { printUserWindow(record); });
    if (formEl) formEl.addEventListener('input', function () { refreshDirtyIndicator(record); });

    MicroDixieWindows.registerWindow({
      id: winId,
      panel: panel,
      title: user.name || user.id,
      badge: user.role || '',
      badgeClassName: 'role-badge ' + roleBadgeClass(user.role),
      closeBtn: panel.querySelector('.uw-close'),
      defaultWidth: 460,
      defaultHeight: 560,
      onBeforeClose: function () {
        if (!isUserWindowDirty(record)) return true;
        return window.confirm('Des modifications non enregistrées seront perdues. Fermer quand même ?');
      }
    });

    userWindows[winId] = record;
    return record;
  }

  // Opens (or focuses/restores) a single fiche utilisateur window; one window per user id, never duplicated
  function openUserWindow(userId) {
    const user = users.find(function (u) { return u.id === userId; });
    if (!user) { showMessage('Utilisateur introuvable.', 'error'); return; }

    const winId = userWindowIdFor(userId);
    let record = userWindows[winId];
    if (!record) record = createUserWindow(user);
    else populateUserWindow(record, user);

    if (MicroDixieWindows.isOpen(winId)) MicroDixieWindows.bringWindowToFront(winId);
    else if (MicroDixieWindows.isMinimized(winId)) MicroDixieWindows.restoreWindow(winId);
    else MicroDixieWindows.openWindow(winId);
  }

  // Theme and back-to-top
  function applyTheme(theme) { if (theme === 'dark') document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); localStorage.setItem(THEME_KEY, theme); addJournal('Thème', theme); }
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light'; applyTheme(savedTheme);
  if (themeToggleBtn) themeToggleBtn.addEventListener('click', function () { const t = document.documentElement.classList.contains('dark') ? 'light' : 'dark'; applyTheme(t); showMessage('Thème ' + t, 'success'); showToast('Thème ' + (t === 'dark' ? 'sombre' : 'clair') + ' activé', 'info'); });
  if (backToTopBtn) {
    // Keeps the button clear of the minimized-windows dock so it is never hidden behind it
    const windowDockEl = document.getElementById('windowDock');
    const updateDockClearance = function () {
      if (!windowDockEl) return;
      const dockHeight = windowDockEl.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--dock-clearance', dockHeight > 0 ? (dockHeight + 14) + 'px' : '0px');
    };
    if (windowDockEl && 'ResizeObserver' in window) new ResizeObserver(updateDockClearance).observe(windowDockEl);
    updateDockClearance();

    window.addEventListener('scroll', function () { backToTopBtn.classList.toggle('visible', window.scrollY > 200); });
    backToTopBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  // UI helpers
  function showMessage(text, type) { if (!messageEl) return; messageEl.textContent = text; messageEl.className = 'form-message ' + (type === 'error' ? 'error' : 'success'); clearTimeout(showMessage._t); showMessage._t = setTimeout(function () { messageEl.textContent = ''; messageEl.className = 'form-message'; }, 3000); }

  function updateCount() { if (totalEl) totalEl.textContent = String(users.length); if (!filteredEl || !tableBody) return; const filtered = getFilteredUsers(); filteredEl.textContent = String(filtered.length); renderStats(); renderJournal(); }

  function createEmptyState() { if (!tableBody) return; tableBody.innerHTML = ''; const tr = document.createElement('tr'); tr.className = 'empty-state'; const td = document.createElement('td'); td.colSpan = 6; td.textContent = 'Aucun utilisateur enregistré pour le moment.'; tr.appendChild(td); tableBody.appendChild(tr); updateCount(); }

  function addJournal(action, name) { const now = new Date(); const hh = String(now.getHours()).padStart(2, '0'); const mm = String(now.getMinutes()).padStart(2, '0'); const time = hh + ':' + mm; const text = name ? `${time} - ${action} : ${name}` : `${time} - ${action}`; journalEntries.unshift({ time: time, text: text }); if (journalEntries.length > 300) journalEntries.pop(); renderJournal(); if (Object.prototype.hasOwnProperty.call(TOAST_ACTIONS, action)) showToast(name ? `${action} : ${name}` : action, TOAST_ACTIONS[action]); }

  // Top-right toast notification, auto-dismissed, closable with the X button
  function showToast(message, type) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast ' + (type || 'info');
    const msg = document.createElement('span');
    msg.className = 'toast-message';
    msg.textContent = message;
    toast.appendChild(msg);
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('aria-label', 'Fermer la notification');
    closeBtn.textContent = '✕';
    let dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      toast.classList.add('closing');
      setTimeout(function () { toast.remove(); }, 180);
    }
    closeBtn.addEventListener('click', dismiss);
    toast.appendChild(closeBtn);
    toastContainer.appendChild(toast);
    setTimeout(dismiss, 3500);
  }

  // Event bindings
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const values = { name: nameField ? nameField.value.trim() : '', email: emailField ? emailField.value.trim() : '', role: roleField ? roleField.value : '' };
      if (!values.name || !values.email || !values.role) { showMessage('Formulaire incomplet.', 'error'); return; }
      if (editId) { updateUser(editId, values); } else { addUser(values); }
      form.reset();
      cancelEdit();
    });
  }

  if (submitBtn) { submitBtn.addEventListener('click', function (e) { e.preventDefault(); form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); }); }
  if (cancelEditBtn) { cancelEditBtn.addEventListener('click', function (e) { e.preventDefault(); cancelEdit(); }); }

  if (searchInput) searchInput.addEventListener('input', renderUsers);
  if (roleFilter) roleFilter.addEventListener('change', renderUsers);
  if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', function () { if (searchInput) searchInput.value = ''; if (roleFilter) roleFilter.value = 'all'; renderUsers(); addJournal('Filtres réinitialisés', null); });

  if (clearUsersBtn) { clearUsersBtn.addEventListener('click', function () { var ok = confirm('Confirmer le vidage complet des utilisateurs ?'); if (!ok) return; users = []; saveUsers(); renderUsers(); addJournal('Vider la liste', null); }); }

  if (exportJsonBtn) exportJsonBtn.addEventListener('click', exportUsers);
  if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportUsersTableCsv);
  if (importJsonBtn && importFileInput) { importJsonBtn.addEventListener('click', function () { importFileInput.click(); }); importFileInput.addEventListener('change', handleImportFile); }
  if (loadDemoBtn) loadDemoBtn.addEventListener('click', loadDemoData);

  // init
  loadUsers();
  renderUsers();
  renderStats();
  renderJournal();

  // Header clock (day, date, time with seconds) — updates every second
  try {
    const headerClockEl = document.getElementById('headerClock');
    const CLOCK_DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    function updateHeaderClock() {
      if (!headerClockEl) return;
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const hh = String(now.getHours()).padStart(2, '0');
      const mi = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      headerClockEl.textContent = `${CLOCK_DAYS[now.getDay()]} ${dd}/${mm}/${now.getFullYear()} - ${hh}:${mi}:${ss}`;
    }
    updateHeaderClock();
    setInterval(updateHeaderClock, 1000);
  } catch (err) { /* non fatal */ }

  // Header collapse/open state (DV9.5 compact header)
  try {
    const HEADER_KEY = 'microDixieHeaderCollapsed';
    const headerEl = document.querySelector('.global-header');
    const headerCollapseBtn = document.getElementById('headerCollapseBtn');
    // Keeps --header-height in sync so the fixed sidebar starts right below the header
    function updateHeaderHeightVar() {
      if (headerEl) document.documentElement.style.setProperty('--header-height', headerEl.offsetHeight + 'px');
    }
    function applyHeaderState(collapsed) {
      if (!headerEl) return;
      if (collapsed) headerEl.classList.add('collapsed'); else headerEl.classList.remove('collapsed');
      if (headerCollapseBtn) headerCollapseBtn.textContent = collapsed ? '▸' : '▾';
      updateHeaderHeightVar();
    }
    const saved = localStorage.getItem(HEADER_KEY) === 'true';
    applyHeaderState(saved);
    window.addEventListener('resize', updateHeaderHeightVar);
    if (headerCollapseBtn) headerCollapseBtn.addEventListener('click', function () {
      const newState = !headerEl.classList.contains('collapsed');
      applyHeaderState(newState);
      try { localStorage.setItem(HEADER_KEY, String(newState)); } catch (e) { /* ignore */ }
    });
  } catch (err) { /* non fatal */ }

  // Sidebar collapsible sections (open/closed state persisted in localStorage)
  try {
    const SIDEBAR_SECTIONS_KEY = 'microDixieSidebarSections';
    const defaultSidebarState = { principal: true, data: true, tools: true, system: false };
    let sidebarState;
    try {
      const rawState = localStorage.getItem(SIDEBAR_SECTIONS_KEY);
      sidebarState = rawState ? Object.assign({}, defaultSidebarState, JSON.parse(rawState)) : Object.assign({}, defaultSidebarState);
    } catch (e) { sidebarState = Object.assign({}, defaultSidebarState); }

    function saveSidebarState() {
      try { localStorage.setItem(SIDEBAR_SECTIONS_KEY, JSON.stringify(sidebarState)); } catch (e) { /* ignore */ }
    }

    function setSidebarSectionOpen(section, open) {
      const btn = section.querySelector('.sidebar-title');
      section.classList.toggle('collapsed', !open);
      if (btn) btn.setAttribute('aria-expanded', String(open));
    }

    document.querySelectorAll('.sidebar-section[data-section]').forEach(function (section) {
      const key = section.dataset.section;
      const open = Object.prototype.hasOwnProperty.call(sidebarState, key) ? sidebarState[key] : true;
      setSidebarSectionOpen(section, open);
      const btn = section.querySelector('.sidebar-title');
      if (!btn) return;
      btn.addEventListener('click', function () {
        const nowOpen = section.classList.contains('collapsed');
        setSidebarSectionOpen(section, nowOpen);
        sidebarState[key] = nowOpen;
        saveSidebarState();
      });
    });
  } catch (err) { /* non fatal */ }

  // Historique window — first consumer of the shared MicroDixieWindows manager
  try {
    const versionPanel = document.getElementById('versionPanel');
    MicroDixieWindows.registerWindow({
      id: 'version',
      panel: versionPanel,
      title: 'Historique',
      badge: 'DV10',
      defaultWidth: 580,
      defaultHeight: 480
    });

    const versioningBtn = document.getElementById('versioningBtn');
    if (versioningBtn) {
      versioningBtn.addEventListener('click', function () {
        if (!versionPanel) return;
        if (MicroDixieWindows.isOpen('version')) { MicroDixieWindows.bringWindowToFront('version'); return; }
        if (MicroDixieWindows.isMinimized('version')) { MicroDixieWindows.restoreWindow('version'); return; }
        MicroDixieWindows.openWindow('version');
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (MicroDixieWindows.isOpen('version')) MicroDixieWindows.requestClose('version');
    });
  } catch (err) { /* non-fatal */ }

});
