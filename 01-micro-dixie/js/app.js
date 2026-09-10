document.addEventListener('DOMContentLoaded', function () {
  const STORAGE_KEY = 'microDixieUsers';

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

  const submitBtn = document.getElementById('submitBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');

  // State
  let users = [];
  let journalEntries = [];
  let editId = null;

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
      editBtn.addEventListener('click', function () {
        startEdit(u.id);
      });
      tdActions.appendChild(editBtn);

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn delete';
      delBtn.textContent = 'Supprimer';
      delBtn.addEventListener('click', function () {
        deleteUser(u.id);
      });
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

  // Actions
  function addUser(data) {
    const user = {
      id: String(Date.now()) + '-' + Math.floor(Math.random() * 10000),
      name: data.name,
      email: data.email,
      role: data.role
    };
    users.push(user);
    saveUsers();
    renderUsers();
    showMessage('Utilisateur ajouté.', 'success');
    addJournal('Utilisateur ajouté', user.name);
  }

  function updateUser(id, values) {
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return showMessage('Utilisateur introuvable.', 'error');
    users[idx].name = values.name;
    users[idx].email = values.email;
    users[idx].role = values.role;
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
    editId = id;
    if (nameField) nameField.value = found.name;
    if (emailField) emailField.value = found.email;
    if (roleField) roleField.value = found.role;
    if (submitBtn) submitBtn.textContent = 'Mettre à jour';
    if (cancelEditBtn) cancelEditBtn.style.display = 'inline-block';
  }

  function cancelEdit() {
    editId = null;
    form.reset();
    if (submitBtn) submitBtn.textContent = 'Ajouter';
    if (cancelEditBtn) cancelEditBtn.style.display = 'none';
  }

  // Import/Export/Demo
  function exportUsers() {
    try {
      const data = users.map(u => ({ name: u.name, email: u.email, role: u.role }));
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

  function validateImported(data) {
    if (!Array.isArray(data)) return false;
    for (let i = 0; i < data.length; i++) {
      const it = data[i];
      if (!it || typeof it !== 'object') return false;
      if (typeof it.name !== 'string' || !it.name.trim()) return false;
      if (typeof it.email !== 'string' || !it.email.trim()) return false;
      if (typeof it.role !== 'string' || !it.role.trim()) return false;
    }
    return true;
  }

  function handleImportFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!validateImported(parsed)) {
          showMessage('Fichier JSON invalide : structure attendue non respectée.', 'error');
          importFileInput.value = '';
          return;
        }
        const imported = parsed.map(function (it) {
          return {
            id: String(Date.now()) + '-' + Math.floor(Math.random() * 10000) + '-' + Math.floor(Math.random() * 1000),
            name: String(it.name).trim(),
            email: String(it.email).trim(),
            role: String(it.role).trim()
          };
        });
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

  function loadDemoData() {
    const demo = [
      { name: 'Alice Martin', email: 'alice@demo.local', role: 'Administrateur' },
      { name: 'Bruno Leroy', email: 'bruno@demo.local', role: 'Éditeur' },
      { name: 'Claire Simon', email: 'claire@demo.local', role: 'Observateur' }
    ];
    const mapped = demo.map(function (d) {
      return { id: String(Date.now()) + '-' + Math.floor(Math.random() * 10000) + '-' + Math.floor(Math.random() * 1000), name: d.name, email: d.email, role: d.role };
    });
    users = users.concat(mapped);
    saveUsers();
    renderUsers();
    addJournal('Charger une démo', null);
    showMessage('Données de démonstration ajoutées.', 'success');
  }

  // UI helpers
  function showMessage(text, type) {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.className = 'form-message ' + (type === 'error' ? 'error' : 'success');
    clearTimeout(showMessage._t);
    showMessage._t = setTimeout(function () {
      messageEl.textContent = '';
      messageEl.className = 'form-message';
    }, 3000);
  }

  function updateCount() {
    if (totalEl) totalEl.textContent = String(users.length);
    if (!filteredEl || !tableBody) return;
    const q = (searchInput && searchInput.value || '').trim().toLowerCase();
    const role = roleFilter ? roleFilter.value : 'all';
    const filtered = users.filter(function (u) {
      const matchesRole = role === 'all' || (u.role || '') === role;
      const inText = !q || (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q));
      return matchesRole && inText;
    });
    filteredEl.textContent = String(filtered.length);
    renderStats();
    renderJournal();
  }

  function createEmptyState() {
    if (!tableBody) return;
    tableBody.innerHTML = '';
    const tr = document.createElement('tr');
    tr.className = 'empty-state';
    const td = document.createElement('td');
    td.colSpan = 4;
    td.textContent = 'Aucun utilisateur enregistré pour le moment.';
    tr.appendChild(td);
    tableBody.appendChild(tr);
    updateCount();
  }

  function addJournal(action, name) {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const time = hh + ':' + mm;
    const text = name ? `${time} - ${action} : ${name}` : `${time} - ${action}`;
    journalEntries.unshift({ time: time, text: text });
    if (journalEntries.length > 200) journalEntries.pop();
    renderJournal();
  }

  // Event bindings
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const values = {
        name: nameField ? nameField.value.trim() : '',
        email: emailField ? emailField.value.trim() : '',
        role: roleField ? roleField.value : ''
      };
      if (!values.name || !values.email || !values.role) {
        showMessage('Formulaire incomplet.', 'error');
        return;
      }
      if (editId) {
        updateUser(editId, values);
      } else {
        addUser(values);
      }
      form.reset();
      cancelEdit();
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', function (e) {
      e.preventDefault();
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  }
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', function (e) {
      e.preventDefault();
      cancelEdit();
    });
  }

  if (searchInput) searchInput.addEventListener('input', renderUsers);
  if (roleFilter) roleFilter.addEventListener('change', renderUsers);
  if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', function () {
    if (searchInput) searchInput.value = '';
    if (roleFilter) roleFilter.value = 'all';
    renderUsers();
    addJournal('Filtres réinitialisés', null);
  });

  if (clearUsersBtn) {
    clearUsersBtn.addEventListener('click', function () {
      var ok = confirm('Confirmer le vidage complet des utilisateurs ?');
      if (!ok) return;
      users = [];
      saveUsers();
      renderUsers();
      addJournal('Vider la liste', null);
    });
  }

  if (exportJsonBtn) exportJsonBtn.addEventListener('click', exportUsers);
  if (importJsonBtn && importFileInput) {
    importJsonBtn.addEventListener('click', function () { importFileInput.click(); });
    importFileInput.addEventListener('change', handleImportFile);
  }
  if (loadDemoBtn) loadDemoBtn.addEventListener('click', loadDemoData);

  // init
  loadUsers();
  renderUsers();

});
