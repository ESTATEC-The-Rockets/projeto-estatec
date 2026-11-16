window.estatecFetch = window.estatecFetch || ((url, options = {}) => fetch(url, { credentials: "include", ...options }));
(function () {
    'use strict';

    const API = (window.ESTATEC_API_ORIGIN + "");
    const paths = { user: '/condutores', car: '/carros', parking: '/estacionamento' };
    const labels = { user: 'condutor', car: 'carro', parking: 'estacionamento' };
    const pageTypes = { usuarios: 'user', carros: 'car', estacionamentos: 'parking' };
    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const canManage = type => localStorage.getItem('isAdmin') === 'true';

    function iconButton(action, type, id) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `entity-icon entity-icon-${action}`;
        button.dataset.entityAction = action;
        button.dataset.entityType = type;
        if (id) button.dataset.entityId = id;
        const verb = action === 'create' ? 'Criar' : action === 'edit' ? 'Editar' : 'Excluir';
        const text = action === 'create' ? `${verb} ${labels[type]}` : verb;
        button.setAttribute('aria-label', id ? `${verb} ${labels[type]} ${id}` : text);
        button.title = button.getAttribute('aria-label');
        button.innerHTML = `<i class="fa-solid fa-${action === 'create' ? 'plus' : action === 'edit' ? 'pencil' : 'trash'}" aria-hidden="true"></i><span>${text}</span>`;
        return button;
    }

    function emptyCallToAction(type) {
        const results = document.getElementById('listResults') || document.getElementById('carResults');
        const search = document.getElementById('listSearch') || document.getElementById('carSearch');
        if (!results || results.querySelector('[data-entity-empty-action]') || search?.value.trim() || results.querySelector('[data-entity-card]')) return;
        if (!/Nenhum/i.test(results.textContent)) return;
        const cta = document.createElement('div');
        cta.className = 'entity-empty-cta';
        cta.dataset.entityEmptyAction = type;
        const button = iconButton('create', type);
        button.innerHTML = '<i class="fa-solid fa-plus" aria-hidden="true"></i><span>Cadastrar novo ' + labels[type] + '</span>';
        cta.append(button);
        results.append(cta);
    }

    function decorate() {
        if (!canManage()) return;
        const type = pageTypes[document.body.dataset.page];
        const toolbar = document.querySelector('#pageContent .toolbar');
        if (type && type !== 'car' && toolbar && !toolbar.querySelector('[data-entity-action="create"]')) {
            toolbar.append(iconButton('create', type)); emptyCallToAction(type);
        }
        const cars = document.querySelector('[data-driver-cars]');
        if (cars && !cars.querySelector('[data-entity-action="create"]')) {
            const button = iconButton('create', 'car');
            button.dataset.condutorId = cars.dataset.driverCars;
            button.querySelector('span').textContent = 'Cadastrar carro deste condutor';
            cars.append(button);
        }
        document.querySelectorAll('[data-profile-entity]').forEach(panel => {
            if (panel.querySelector('.profile-actions')) return;
            const actions = document.createElement('div'); actions.className = 'profile-actions';
            actions.append(iconButton('edit', panel.dataset.profileEntity, panel.dataset.profileId), iconButton('delete', panel.dataset.profileEntity, panel.dataset.profileId));
            panel.append(actions);
        });
    }

    function field(name, label, value = '', extra = '') {
        return `<label>${label}<input name="${name}" value="${escapeHtml(value)}" ${extra}></label>`;
    }

    function openModal(type, id = '', row = {}, condutorId = null) {
        const dialog = document.createElement('dialog');
        dialog.className = 'entity-modal';
        const fields = type === 'user'
            ? field('nome', 'Nome', row.nome, 'required maxlength="120"') + field('email', 'E-mail', row.email, 'type="email" required maxlength="120"') + field('cpf', 'CPF', row.cpf, 'required') + field('telefone', 'Telefone', row.telefone, 'required')
            : type === 'car'
                ? field('marca', 'Marca', row.marca, 'required minlength="2" maxlength="50"') + field('modelo', 'Modelo', row.modelo, 'required minlength="2" maxlength="50"') + field('placa', 'Placa', row.placa, 'required maxlength="8"') + `<label>Cor<select name="cor" required><option value="">Selecione uma cor</option>${['BRANCO', 'PRETO', 'PRATA', 'OUTROS'].map(color => `<option value="${color}" ${row.cor === color ? 'selected' : ''}>${color}</option>`).join('')}</select></label>`
                : field('nomeEstacionamento', 'Nome do estacionamento', row.nomeEstacionamento, 'required maxlength="100"');
        dialog.innerHTML = `<div class="entity-modal-card"><button type="button" class="modal-close" data-entity-close aria-label="Fechar">×</button><h2>${id ? 'Editar' : 'Criar'} ${labels[type]}</h2><form class="entity-form"><div class="entity-form-grid">${fields}</div><p class="entity-modal-status" role="status" aria-live="polite"></p><div class="entity-modal-actions"><button type="button" class="btn-cancel" data-entity-close>Cancelar</button><button type="submit" class="btn-primary">Salvar</button></div></form></div>`;
        document.body.append(dialog);
        const close = () => { if (dialog.open) dialog.close(); dialog.remove(); };
        dialog.querySelectorAll('[data-entity-close]').forEach(button => button.addEventListener('click', close));
        dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
        dialog.querySelector('form').addEventListener('invalid', event => {
            dialog.querySelector('.entity-modal-status').textContent = window.EstatecMessages.invalid(event.target);
        }, true);
        dialog.querySelector('form').addEventListener('submit', async event => {
            event.preventDefault();
            const form = event.currentTarget;
            const status = dialog.querySelector('.entity-modal-status');
            const values = Object.fromEntries(new FormData(form).entries());
            const ownerId = row.usuario?.id ?? row.usario?.id ?? null;
            const payload = type === 'user'
                ? values
                : type === 'car'
                    ? { marca: values.marca, modelo: values.modelo, placa: values.placa.toUpperCase(), cor: values.cor }
                    : { nomeEstacionamento: values.nomeEstacionamento, usuario: ownerId ? { id: Number(ownerId) } : null };
            try {
                form.querySelectorAll('input, select, button').forEach(control => { control.disabled = true; });
                const endpoint = type === 'car' && !id ? `${API}/condutores/${encodeURIComponent(condutorId)}/carros` : `${API}${paths[type]}${id ? `/${encodeURIComponent(id)}` : type === 'user' ? '/cadastro' : ''}`;
                const response = await window.estatecFetch(endpoint, { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!response.ok) { const error = await response.json().catch(() => ({})); throw window.EstatecMessages.failure(window.EstatecMessages.fromResponse(error, response.status)); }
                close();
                window.Interface?.notify(`${labels[type][0].toUpperCase() + labels[type].slice(1)} salvo com sucesso.`, 'success');
                location.reload();
            } catch (error) {
                status.textContent = window.EstatecMessages.error(error, 'Não foi possível salvar.');
                form.querySelectorAll('input, select, button').forEach(control => { control.disabled = false; });
            }
        });
        dialog.showModal();
    }

    async function fetchRow(type, id) {
        const response = await window.estatecFetch(`${API}${paths[type]}/${encodeURIComponent(id)}`);
        if (!response.ok) throw window.EstatecMessages.failure('Não foi possível carregar as informações.');
        return response.json();
    }

    async function remove(type, id) {
        const approved = await (window.Interface?.confirm || (async message => confirm(message)))(`Deseja excluir este ${labels[type]}?`);
        if (!approved) return;
        const response = await window.estatecFetch(`${API}${paths[type]}/${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (!response.ok) { const error = await response.json().catch(() => ({})); throw window.EstatecMessages.failure(window.EstatecMessages.fromResponse(error, response.status)); }
        location.href = type === 'car' ? './carros.html' : type === 'user' ? './usuario.html' : './estacionamentos.html';
    }

    document.addEventListener('click', async event => {
        const button = event.target.closest('[data-entity-action]');
        if (!button || button.disabled) return;
        const type = button.dataset.entityType;
        if (!canManage(type)) return;
        const action = button.dataset.entityAction;
        button.disabled = true;
        try {
            if (action === 'create') {
                const context = document.querySelector('[data-driver-cars]');
                if (type === 'car' && (!context || context.dataset.driverCars !== button.dataset.condutorId)) throw window.EstatecMessages.failure('Abra o perfil do condutor para cadastrar o carro.');
                openModal(type, '', {}, button.dataset.condutorId);
            }
            if (action === 'edit') openModal(type, button.dataset.entityId, await fetchRow(type, button.dataset.entityId));
            if (action === 'delete') { button.disabled = true; await remove(type, button.dataset.entityId); }
        } catch (error) {
            button.disabled = false;
            window.Interface?.notify(window.EstatecMessages.error(error), 'error');
        } finally { button.disabled = false; }
    });

    document.addEventListener('DOMContentLoaded', () => {
        decorate();
        new MutationObserver(decorate).observe(document.getElementById('pageContent') || document.body, { childList: true, subtree: true });
    });
})();
