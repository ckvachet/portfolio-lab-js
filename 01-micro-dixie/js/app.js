document.addEventListener('DOMContentLoaded', function () {
  const STORAGE_KEY = 'microDixieUsers';
  const THEME_KEY = 'microDixieTheme';

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
  const activityLog = document.getElementById('activityLog');

  const importJsonBtn = document.getElementById('importJsonBtn');
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  const loadDemoBtn = document.getElementById('loadDemoBtn');
  const importFileInput = document.getElementById('importFileInput');
  const clearUsersBtn = document.getElementById('clearUsersBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const backToTopBtn = document.getElementById('backToTop');

  // Modal elements
  const modal = document.getElementById('userModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const modalId = document.getElementById('modalId');
  const modalName = document.getElementById('modalName');
  const modalEmail = document.getElementById('modalEmail');
  const modalRole = document.getElementById('modalRole');
  const modalAddress = document.getElementById('modalAddress');
  const modalLocality = document.getElementById('modalLocality');
  const modalPrivatePhone = document.getElementById('modalPrivatePhone');
  const modalProfessionalPhone = document.getElementById('modalProfessionalPhone');
  const modalBirthDate = document.getElementById('modalBirthDate');
  const modalAvatar = document.getElementById('modalAvatar');
  const modalSave = document.getElementById('modalSave');
  const modalCancel = document.getElementById('modalCancel');

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

    const q = (searchInput && searchInput.value || '').trim().toLowerCase();
    const role = roleFilter ? roleFilter.value : 'all';

    const filtered = users.filter(function (u) {
      const matchesRole = role === 'all' || (u.role || '') === role;
      const inText = !q || (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q));
      return matchesRole && inText;
    });

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
      badge.className = 'role-badge';
      const roleLower = (u.role || '').toLowerCase();
      if (roleLower.includes('admin')) badge.classList.add('role-admin');
      else if (roleLower.includes('édit') || roleLower.includes('edit')) badge.classList.add('role-editor');
      else badge.classList.add('role-observer');
      badge.textContent = u.role;
      tdRole.appendChild(badge);
      tr.appendChild(tdRole);

      const tdActions = document.createElement('td');

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn edit';
      editBtn.textContent = 'Modifier';
      editBtn.addEventListener('click', function () { startEdit(u.id); });
      tdActions.appendChild(editBtn);

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn delete';
      delBtn.textContent = 'Supprimer';
      delBtn.addEventListener('click', function () { deleteUser(u.id); });
      tdActions.appendChild(delBtn);

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
    statTotal.textContent = String(total);
    statAdmin.textContent = String(admin);
    statEditor.textContent = String(editor);
    statObserver.textContent = String(observer);
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
    const user = Object.assign({ id: generateNextId(), address: '', locality: '', privatePhone: '', professionalPhone: '', birthDate: '' }, data);
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

  function deleteUser(id) {
    const found = users.find(function (u) { return u.id === id; });
    const name = found ? found.name : null;
    users = users.filter(function (u) { return u.id !== id; });
    saveUsers();
    renderUsers();
    if (!users.length) createEmptyState();
    addJournal('Utilisateur supprimé', name);
  }

  function startEdit(id) {
    const found = users.find(u => u.id === id);
    if (!found) return showMessage('Utilisateur introuvable.', 'error');
    // open modal (populate + ensure visible)
    openUserModal(found);
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
      addJournal('Export JSON', `${data.length} utilisateur(s)`);
      showMessage('Export JSON téléchargé.', 'success');
    } catch (e) {
      console.error('Erreur export', e);
      showMessage('Erreur lors de l’exportation.', 'error');
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

  // Modal logic
  function openModalWithUser(user) {
    if (!modal) return;
    // ensure we read fresh elements from DOM (robustness)
    const elId = document.getElementById('modalId');
    const elName = document.getElementById('modalName');
    const elEmail = document.getElementById('modalEmail');
    const elRole = document.getElementById('modalRole');
    const elAddress = document.getElementById('modalAddress');
    const elLocality = document.getElementById('modalLocality');
    const elPrivatePhone = document.getElementById('modalPrivatePhone');
    const elProfessionalPhone = document.getElementById('modalProfessionalPhone');
    const elBirthDate = document.getElementById('modalBirthDate');
    const elAvatar = document.getElementById('modalAvatar');

    // assign an ID if missing
    if (!user.id) {
      user.id = generateNextId();
      // persist the new id for this user in the users array if present
      const idx = users.findIndex(u => u === user || (u.name === user.name && u.email === user.email));
      if (idx !== -1) {
        users[idx].id = user.id;
        saveUsers();
        computeNextIdCounter();
      }
    }

    modal.hidden = false;
    if (elId) { elId.value = user.id || ''; elId.readOnly = true; }
    if (elName) elName.value = user.name || '';
    if (elEmail) elEmail.value = user.email || '';
    if (elRole) elRole.value = user.role || '';
    if (elAddress) elAddress.value = user.address || '';
    if (elLocality) elLocality.value = user.locality || '';
    if (elPrivatePhone) elPrivatePhone.value = user.privatePhone || '';
    if (elProfessionalPhone) elProfessionalPhone.value = user.professionalPhone || '';
    if (elBirthDate) elBirthDate.value = user.birthDate || '';
    if (elAvatar) elAvatar.textContent = initialsFromName(user.name || '');

    editId = user.id;
    addJournal('Ouverture modale', user.name);
    if (modalSave) modalSave.focus();
  }

  // New public open/close helpers to manage visibility reliably
  function openUserModal(userOrId) {
    if (!modal) return;
    let user = null;
    if (!userOrId) return;
    if (typeof userOrId === 'string') user = users.find(u => u.id === userOrId);
    else user = userOrId;
    if (!user) return;
    openModalWithUser(user);
    // ensure visible despite CSS display rule
    modal.classList.add('open');
    modal.style.display = 'flex';
    modal.hidden = false;
  }

  function closeUserModal() {
    if (!modal) return;
    // hide modal reliably
    modal.hidden = true;
    modal.classList.remove('open');
    modal.style.display = 'none';
    // reset edit state but do not save
    editId = null;
    // clear temporary modal fields (do not persist)
    const mf = document.getElementById('modalForm');
    if (mf && typeof mf.reset === 'function') mf.reset();
  }

  function saveModal() {
    if (!editId) return closeUserModal();
    const values = { name: modalName.value.trim(), email: modalEmail.value.trim(), role: modalRole.value, address: modalAddress.value.trim(), locality: modalLocality.value.trim(), privatePhone: modalPrivatePhone.value.trim(), professionalPhone: modalProfessionalPhone.value.trim(), birthDate: modalBirthDate.value };
    if (!values.name || !values.email || !values.role) { showMessage('Nom, email et rôle sont obligatoires.', 'error'); return; }
    updateUser(editId, values);
    closeUserModal();
  }

  if (modalClose) modalClose.addEventListener('click', function () { closeUserModal(); });
  if (modalCancel) modalCancel.addEventListener('click', function (e) { closeUserModal(); });
  if (modalOverlay) modalOverlay.addEventListener('click', function (e) { if (e.target === modalOverlay) closeUserModal(); });
  if (modalSave) modalSave.addEventListener('click', function (e) { e.preventDefault(); saveModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeUserModal(); });

  // Theme and back-to-top
  function applyTheme(theme) { if (theme === 'dark') document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); localStorage.setItem(THEME_KEY, theme); addJournal('Thème', theme); }
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light'; applyTheme(savedTheme);
  if (themeToggleBtn) themeToggleBtn.addEventListener('click', function () { const t = document.documentElement.classList.contains('dark') ? 'light' : 'dark'; applyTheme(t); showMessage('Thème ' + t, 'success'); });
  if (backToTopBtn) { window.addEventListener('scroll', function () { if (window.scrollY > 200) backToTopBtn.style.display = 'block'; else backToTopBtn.style.display = 'none'; }); backToTopBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); }); }

  // UI helpers
  function showMessage(text, type) { if (!messageEl) return; messageEl.textContent = text; messageEl.className = 'form-message ' + (type === 'error' ? 'error' : 'success'); clearTimeout(showMessage._t); showMessage._t = setTimeout(function () { messageEl.textContent = ''; messageEl.className = 'form-message'; }, 3000); }

  function updateCount() { if (totalEl) totalEl.textContent = String(users.length); if (!filteredEl || !tableBody) return; const q = (searchInput && searchInput.value || '').trim().toLowerCase(); const role = roleFilter ? roleFilter.value : 'all'; const filtered = users.filter(function (u) { const matchesRole = role === 'all' || (u.role || '') === role; const inText = !q || (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q)); return matchesRole && inText; }); filteredEl.textContent = String(filtered.length); renderStats(); renderJournal(); }

  function createEmptyState() { if (!tableBody) return; tableBody.innerHTML = ''; const tr = document.createElement('tr'); tr.className = 'empty-state'; const td = document.createElement('td'); td.colSpan = 5; td.textContent = 'Aucun utilisateur enregistré pour le moment.'; tr.appendChild(td); tableBody.appendChild(tr); updateCount(); }

  function addJournal(action, name) { const now = new Date(); const hh = String(now.getHours()).padStart(2, '0'); const mm = String(now.getMinutes()).padStart(2, '0'); const time = hh + ':' + mm; const text = name ? `${time} - ${action} : ${name}` : `${time} - ${action}`; journalEntries.unshift({ time: time, text: text }); if (journalEntries.length > 300) journalEntries.pop(); renderJournal(); }

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
  if (importJsonBtn && importFileInput) { importJsonBtn.addEventListener('click', function () { importFileInput.click(); }); importFileInput.addEventListener('change', handleImportFile); }
  if (loadDemoBtn) loadDemoBtn.addEventListener('click', loadDemoData);

  if (modal) { /* nothing */ }

  // init
  loadUsers();
  renderUsers();
  renderStats();
  renderJournal();
  // ensure modal is closed on initial load (prevents CSS .modal display from showing it)
  try { closeUserModal(); } catch (e) { /* ignore */ }

});
