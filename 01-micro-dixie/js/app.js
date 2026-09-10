document.addEventListener('DOMContentLoaded', function () {
	const form = document.getElementById('userForm');
	const nameField = document.getElementById('userName');
	const emailField = document.getElementById('userEmail');
	const roleField = document.getElementById('userRole');
	const tableBody = document.getElementById('usersTableBody');
    const messageEl = document.getElementById('formMessage');
    const countEl = document.getElementById('userCount');

	if (!form) {
		console.warn('userForm introuvable');
		return;
	}

	// Ecouteur sur le formulaire
	form.addEventListener('submit', function (event) {
		event.preventDefault();

		const values = {
			name: nameField ? nameField.value : null,
			email: emailField ? emailField.value : null,
			role: roleField ? roleField.value : null
		};

		console.log('Valeurs du formulaire:', values);
		// Validation simple
		if (!values.name || !values.email || !values.role) {
			showMessage('Veuillez compléter tous les champs avant d\'ajouter un utilisateur.', 'error');
			return;
		}

		// Création d'une nouvelle ligne dans le tableau
		if (tableBody) {
			// Supprimer l'état vide s'il existe
			const empty = tableBody.querySelector('.empty-state');
			if (empty) empty.remove();

			const tr = document.createElement('tr');

			const tdName = document.createElement('td');
			tdName.textContent = values.name || '';
			tr.appendChild(tdName);

			const tdEmail = document.createElement('td');
			tdEmail.textContent = values.email || '';
			tr.appendChild(tdEmail);

			const tdRole = document.createElement('td');
			// badge according to role
			const badge = document.createElement('span');
			badge.className = 'role-badge';
			const roleLower = (values.role || '').toLowerCase();
			if (roleLower.includes('admin')) badge.classList.add('role-admin');
			else if (roleLower.includes('édit') || roleLower.includes('edit')) badge.classList.add('role-editor');
			else badge.classList.add('role-observer');
			badge.textContent = values.role || '';
			tdRole.appendChild(badge);
			tr.appendChild(tdRole);

			const tdActions = document.createElement('td');
			const delBtn = document.createElement('button');
			delBtn.type = 'button';
			delBtn.className = 'btn delete';
			delBtn.textContent = 'Supprimer';
			// delete handler
			delBtn.addEventListener('click', function () {
				tr.remove();
				updateCount();
				// if empty, restore empty-state
				if (!tableBody.querySelector('tr')) {
					createEmptyState();
				}
			});
			tdActions.appendChild(delBtn);
			tr.appendChild(tdActions);

			tableBody.appendChild(tr);

			updateCount();
			showMessage('Utilisateur ajouté avec succès.', 'success');
		}

		// Réinitialiser le formulaire
		form.reset();
	});

	// Rendre le bouton "Ajouter" déclencheur du submit si c'est un bouton type=button
	const addButton = form.querySelector('button');
	if (addButton) {
		addButton.addEventListener('click', function (e) {
			e.preventDefault();
			// Déclenche l'événement submit sur le formulaire
			form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
		});
	}

	function showMessage(text, type) {
		if (!messageEl) return;
		messageEl.textContent = text;
		messageEl.className = 'form-message ' + (type === 'error' ? 'error' : 'success');
		// clear after 3s
		clearTimeout(showMessage._t);
		showMessage._t = setTimeout(function () {
			messageEl.textContent = '';
			messageEl.className = 'form-message';
		}, 3000);
	}

	function updateCount() {
		if (!countEl || !tableBody) return;
		// count rows that are not empty-state
		const rows = tableBody.querySelectorAll('tr');
		let c = 0;
		rows.forEach(function (r) {
			if (!r.classList.contains('empty-state')) c++;
		});
		countEl.textContent = String(c);
	}

	function createEmptyState() {
		if (!tableBody) return;
		const tr = document.createElement('tr');
		tr.className = 'empty-state';
		const td = document.createElement('td');
		td.colSpan = 4;
		td.textContent = 'Aucun utilisateur enregistré pour le moment.';
		tr.appendChild(td);
		tableBody.appendChild(tr);
		updateCount();
	}

	// initialise count
	updateCount();
});
