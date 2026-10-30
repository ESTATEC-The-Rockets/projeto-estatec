(function () {
    'use strict';

    const API = 'http://localhost:8080';
    const admin = () => localStorage.getItem('isAdmin') === 'true';
    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    function button(type, id, label) {
        if (!admin() || !id || document.querySelector(`[data-entity-delete="${type}-${id}"]`)) return null;
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'btn-row-delete icon-only-delete';
        item.dataset.entityDelete = `${type}-${id}`;
        item.dataset.entityType = type;
        item.dataset.entityId = id;
        item.dataset.entityLabel = label;
        item.innerHTML = '<i class="fa-solid fa-trash" aria-hidden="true"></i>';
        item.setAttribute('aria-label', `Excluir ${label} ${id}`);
        item.title = `Excluir ${label}`;
        return item;
    }

    function decorate() {
        if (!admin()) return;
        const page = document.body.dataset.page;
        if (page !== 'perfil' && page !== 'estacionamento') return;

        document.querySelectorAll('#listResults article.card').forEach(card => {
            const link = card.querySelector('h2 a[href*="perfil.html?id="], h2 a[href*="estacionamento.html?id="]');
            if (!link || card.querySelector('[data-entity-delete]')) return;
            const match = link.href.match(/(perfil|estacionamento)\.html\?id=(\d+)/);
            if (!match) return;
            const type = match[1] === 'perfil' ? 'user' : 'parking';
            const action = button(type, match[2], type === 'user' ? 'usuário' : 'estacionamento');
            if (action) card.insertBefore(action, card.firstChild.nextSibling);
        });

        document.querySelectorAll('.chip.plate').forEach(chip => {
            if (chip.querySelector('[data-entity-delete]')) return;
            const text = chip.textContent.trim();
            const match = text.match(/^(.+?)\s+·\s+(.+)$/);
            if (!match) return;
            fetch(`${API}/carros`).then(response => response.ok ? response.json() : []).then(cars => {
                const car = cars.find(item => String(item.placa || '').toUpperCase() === match[1].toUpperCase() && String(item.modelo || '') === match[2]);
                if (!car || chip.querySelector('[data-entity-delete]')) return;
                const action = button('car', car.idCarros, 'carro');
                if (action) chip.append(' ', action);
            }).catch(() => { /* A listagem principal continua funcionando. */ });
        });

        const id = new URLSearchParams(location.search).get('id');
        if (id && page === 'perfil') {
            const action = button('user', id, 'usuário');
            const title = document.querySelector('#pageContent .panel h2');
            if (action && title) title.after(action);
        }
        if (id && page === 'estacionamento') {
            const action = button('parking', id, 'estacionamento');
            const title = document.querySelector('#pageContent .panel h2');
            if (action && title) title.after(action);
        }
    }

    async function remove(type, id, label) {
        const approved = await (window.Interface?.confirm || (async message => confirm(message)))(`Excluir ${label} #${id}? Esta ação não pode ser desfeita.`);
        if (!approved) return;
        const paths = { user: '/usuarios', car: '/carros', parking: '/estacionamento' };
        const response = await fetch(`${API}${paths[type]}/${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (!response.ok) {
            const text = await response.text();
            let message = `Falha HTTP ${response.status}`;
            try { message = JSON.parse(text).message || JSON.parse(text).detail || message; } catch { if (text) message = text; }
            throw new Error(message);
        }
        if (type === 'user') location.href = 'usuario.html';
        else if (type === 'parking') location.href = 'estacionamentos.html';
        else location.reload();
    }

    document.addEventListener('click', event => {
        const target = event.target.closest('[data-entity-delete]');
        if (!target || target.disabled || !admin()) return;
        event.preventDefault();
        target.disabled = true;
        remove(target.dataset.entityType, target.dataset.entityId, target.dataset.entityLabel)
            .catch(error => {
                target.disabled = false;
                if (typeof window.Interface?.notify === 'function') window.Interface.notify(`Não foi possível excluir: ${error.message}`, 'error');
                else alert(`Não foi possível excluir: ${error.message}`);
            });
    });

    document.addEventListener('DOMContentLoaded', () => {
        decorate();
        new MutationObserver(decorate).observe(document.getElementById('pageContent') || document.body, { childList: true, subtree: true });
    });
})();
