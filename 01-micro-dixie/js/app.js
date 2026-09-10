document.addEventListener('DOMContentLoaded', function () {
	const form = document.getElementById('userForm');
	const nameField = document.getElementById('userName');
	const emailField = document.getElementById('userEmail');
	const roleField = document.getElementById('userRole');
	const tableBody = document.getElementById('usersTableBody');

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
			tdRole.textContent = values.role || '';
			tr.appendChild(tdRole);

			const tdActions = document.createElement('td');
			tdActions.textContent = 'À venir';
			tr.appendChild(tdActions);

			tableBody.appendChild(tr);
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
});
