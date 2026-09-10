document.addEventListener('DOMContentLoaded', function () {
	const STORAGE_KEY = 'microDixieUsers';
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

	let users = [];
	let journalEntries = [];

	const statTotal = document.getElementById('statTotal');
	const statAdmin = document.getElementById('statAdmin');
	const statEditor = document.getElementById('statEditor');
	const statObserver = document.getElementById('statObserver');
	const activityLog = document.getElementById('activityLog');
	const clearUsersBtn = document.getElementById('clearUsersBtn');

	if (!form) {
		console.warn('userForm introuvable');
		return;
	}

	// Load saved users and render
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

	function renderUsers() {
		if (!tableBody) return;
		// clear
		tableBody.innerHTML = '';
		noResultsMessage.hidden = true;

		// if no users at all -> show empty state
		if (!users.length) {
			createEmptyState();
			updateCount();
			return;
		}

		// apply search + filter
		const q = (searchInput && searchInput.value || '').trim().toLowerCase();
		const role = roleFilter ? roleFilter.value : 'all';

		const filtered = users.filter(function (u) {
			const matchesRole = role === 'all' || (u.role || '') === role;
			const inText = !q || (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q));
			return matchesRole && inText;
		});

		if (!filtered.length) {
			// no match but users exist
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
		showMessage('Utilisateur ajouté avec succès.', 'success');
		addJournal('Utilisateur ajouté', user.name);
	}

	function deleteUser(id) {
		const found = users.find(function (u) { return u.id === id; });
		const name = found ? found.name : null;
		users = users.filter(function (u) {
			return u.id !== id;
		});
		saveUsers();
		renderUsers();
		if (!users.length) createEmptyState();
		addJournal('Utilisateur supprimé', name);
	}

	// Ecouteur sur le formulaire
	form.addEventListener('submit', function (event) {
		event.preventDefault();

		const values = {
			name: nameField ? nameField.value.trim() : '',
			email: emailField ? emailField.value.trim() : '',
			role: roleField ? roleField.value : ''
		};

		// Validation simple
		if (!values.name || !values.email || !values.role) {
			showMessage("Veuillez compléter tous les champs avant d'ajouter un utilisateur.", 'error');
			return;
		}

		addUser(values);
		form.reset();
	});

	// Rendre le bouton "Ajouter" déclencheur du submit si c'est un bouton type=button
	const addButton = form.querySelector('button');
	if (addButton) {
		addButton.addEventListener('click', function (e) {
			e.preventDefault();
			form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
		});
	}

	// filters and search handlers
	if (searchInput) {
		searchInput.addEventListener('input', function () {
			renderUsers();
		});
	}
	if (roleFilter) {
		roleFilter.addEventListener('change', function () {
			renderUsers();
		});
	}
	if (resetFiltersBtn) {
		resetFiltersBtn.addEventListener('click', function () {
			if (searchInput) searchInput.value = '';
			if (roleFilter) roleFilter.value = 'all';
			renderUsers();
			addJournal('Filtres réinitialisés', null);
		});
	}

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
		// compute filtered count
		const q = (searchInput && searchInput.value || '').trim().toLowerCase();
		const role = roleFilter ? roleFilter.value : 'all';
		const filtered = users.filter(function (u) {
			const matchesRole = role === 'all' || (u.role || '') === role;
			const inText = !q || (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q));
			return matchesRole && inText;
		});
		filteredEl.textContent = String(filtered.length);
		renderStats();
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

	function addJournal(action, name) {
		const now = new Date();
		const hh = String(now.getHours()).padStart(2, '0');
		const mm = String(now.getMinutes()).padStart(2, '0');
		const time = hh + ':' + mm;
		const text = name ? `${time} - ${action} : ${name}` : `${time} - ${action}`;
		journalEntries.unshift({ time: time, text: text });
		renderJournal();
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

	// initialisation
	loadUsers();
	renderUsers();
});
