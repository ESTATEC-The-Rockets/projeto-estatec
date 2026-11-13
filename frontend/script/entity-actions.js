window.estatecFetch = window.estatecFetch || ((url, options = {}) => fetch(url, { credentials: "include", ...options }));
(function () {
    'use strict';

    const API = (window.ESTATEC_API_ORIGIN + "");
    const paths = { user: '/usuarios', car: '/carros', parking: '/estacionamento' };
    const labels = { user: 'usuário', car: 'carro', parking: 'estacionamento' };
    const pageTypes = { usuarios: 'user', carros: 'car', estacionamentos: 'parking' };
    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const canManage = type => type !== 'user' && localStorage.getItem('isAdmin') === 'false';

    function sessionUserId() {
        try {
            const session = JSON.parse(localStorage.getItem('usuarioSessao') || 'null');
            return session?.id ?? session?.idUsuario ?? null;
        } catch { return null; }
    }

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
        const type = pageTypes[document.body.dataset.page];
        if (!type || !canManage(type)) return;
        const toolbar = document.querySelector('#pageContent .toolbar');
        if (toolbar && !toolbar.querySelector('[data-entity-action="create"]')) toolbar.append(iconButton('create', type));
        emptyCallToAction(type);
    }

    function field(name, label, value = '', extra = '') {
        return `<label>${label}<input name="${name}" value="${escapeHtml(value)}" ${extra}></label>`;
    }

    function openModal(type, id = '', row = {}) {
        const dialog = document.createElement('dialog');
        dialog.className = 'entity-modal';
        const fields = type === 'user'
            ? field('nome', 'Nome', row.nome, 'required maxlength="120"') + field('email', 'E-mail', row.email, 'type="email" required maxlength="120"') + field('senha', 'Senha', '', 'type="password" minlength="8" required') + field('cpf', 'CPF', row.cpf, 'required') + field('rg', 'RG', row.rg, 'required') + field('telefone', 'Telefone', row.telefone, 'required') + field('dataNascimento', 'Data de nascimento', row.dataNascimento, 'type="date" required')
            : type === 'car'
                ? field('marca', 'Marca', row.marca, 'required minlength="3" maxlength="15"') + field('modelo', 'Modelo', row.modelo, 'required minlength="2" maxlength="50"') + field('placa', 'Placa', row.placa, 'required maxlength="8"') + `<label>Cor<select name="cor" required><option value="">Selecione uma cor</option>${['BRANCO', 'PRETO', 'PRATA', 'OUTROS'].map(color => `<option value="${color}" ${row.cor === color ? 'selected' : ''}>${color}</option>`).join('')}</select></label>`
                : field('nomeEstacionamento', 'Nome do estacionamento', row.nomeEstacionamento, 'required');
        dialog.innerHTML = `<div class="entity-modal-card"><button type="button" class="modal-close" data-entity-close aria-label="Fechar">×</button><h2>${id ? 'Editar' : 'Criar'} ${labels[type]}</h2><form class="entity-form"><div class="entity-form-grid">${fields}</div><p class="entity-modal-status" role="status" aria-live="polite"></p><div class="entity-modal-actions"><button type="button" class="btn-cancel" data-entity-close>Cancelar</button><button type="submit" class="btn-primary">Salvar</button></div></form></div>`;
        document.body.append(dialog);
        const close = () => { if (dialog.open) dialog.close(); dialog.remove(); };
        dialog.querySelectorAll('[data-entity-close]').forEach(button => button.addEventListener('click', close));
        dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
        dialog.querySelector('form').addEventListener('submit', async event => {
            event.preventDefault();
            const form = event.currentTarget;
            const status = dialog.querySelector('.entity-modal-status');
            const values = Object.fromEntries(new FormData(form).entries());
            const ownerId = sessionUserId();
            const payload = type === 'user'
                ? values
                : type === 'car'
                    ? { marca: values.marca, modelo: values.modelo, placa: values.placa.toUpperCase(), cor: values.cor, usuario: ownerId ? { id: Number(ownerId) } : null }
                    : { nomeEstacionamento: values.nomeEstacionamento, usuario: ownerId ? { id: Number(ownerId) } : null };
            try {
                form.querySelectorAll('input, select, button').forEach(control => { control.disabled = true; });
                const endpoint = `${API}${paths[type]}${id ? `/${encodeURIComponent(id)}` : type === 'user' ? '/cadastro' : ''}`;
                const response = await window.estatecFetch(endpoint, { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!response.ok) throw new Error('Não foi possível salvar as informações.');
                close();
                window.Interface?.notify(`${labels[type][0].toUpperCase() + labels[type].slice(1)} salvo com sucesso.`, 'success');
                location.reload();
            } catch (error) {
                status.textContent = `Não foi possível salvar: ${error.message}`;
                form.querySelectorAll('input, select, button').forEach(control => { control.disabled = false; });
            }
        });
        dialog.showModal();
    }

    async function fetchRow(type, id) {
        const response = await window.estatecFetch(`${API}${paths[type]}/${encodeURIComponent(id)}`);
        if (!response.ok) throw new Error('Não foi possível carregar as informações.');
        return response.json();
    }

    async function remove(type, id) {
        const approved = await (window.Interface?.confirm || (async message => confirm(message)))(`Tem certeza que deseja excluir este ${labels[type]}? Esta ação não pode ser desfeita.`);
        if (!approved) return;
        const response = await window.estatecFetch(`${API}${paths[type]}/${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Não foi possível excluir as informações.');
        location.reload();
    }

    document.addEventListener('click', async event => {
        const button = event.target.closest('[data-entity-action]');
        if (!button) return;
        const type = button.dataset.entityType;
        if (!canManage(type)) return;
        const action = button.dataset.entityAction;
        try {
            if (action === 'create') openModal(type);
            if (action === 'edit') openModal(type, button.dataset.entityId, await fetchRow(type, button.dataset.entityId));
            if (action === 'delete') { button.disabled = true; await remove(type, button.dataset.entityId); }
        } catch (error) {
            button.disabled = false;
            window.Interface?.notify(`Não foi possível concluir a operação: ${error.message}`, 'error');
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        decorate();
        new MutationObserver(decorate).observe(document.getElementById('pageContent') || document.body, { childList: true, subtree: true });
    });
})();
