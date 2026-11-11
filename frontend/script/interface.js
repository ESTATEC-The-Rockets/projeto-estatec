/* Utilitários de interface: feedback não bloqueante e confirmação acessível. */
window.Interface = (() => {
    let region;
    function notify(message, type = 'info') {
        if (!region) {
            region = document.createElement('div');
            region.className = 'toast-region';
            region.setAttribute('aria-label', 'Notificações');
            document.body.append(region);
        }
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
        const text = document.createElement('p');
        text.textContent = message;
        const dismiss = document.createElement('button');
        dismiss.type = 'button';
        dismiss.textContent = '×';
        dismiss.setAttribute('aria-label', 'Fechar notificação');
        dismiss.addEventListener('click', () => toast.remove());
        toast.append(text, dismiss);
        region.append(toast);
        while (region.children.length > 3) region.firstElementChild.remove();
        if (type !== 'error') setTimeout(() => { if (!toast.contains(document.activeElement)) toast.remove(); }, 6500);
    }
    function confirmAction(message) {
        return new Promise(resolve => {
            const previousFocus = document.activeElement;
            const dialog = document.createElement('dialog');
            dialog.className = 'confirm-dialog';
            const text = document.createElement('p');
            text.id = 'confirmation-message';
            text.textContent = message;
            dialog.setAttribute('aria-labelledby', text.id);
            const actions = document.createElement('div');
            actions.className = 'dialog-actions';
            const cancel = document.createElement('button');
            cancel.textContent = 'Cancelar';
            const accept = document.createElement('button');
            accept.textContent = 'Confirmar';
            accept.className = 'confirm-action';
            let done = false;
            const finish = value => {
                if (done) return;
                done = true;
                dialog.close();
                dialog.remove();
                if (previousFocus?.isConnected) previousFocus.focus();
                resolve(value);
            };
            cancel.addEventListener('click', () => finish(false));
            accept.addEventListener('click', () => finish(true));
            dialog.addEventListener('cancel', event => { event.preventDefault(); finish(false); });
            dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) finish(false); } });
            actions.append(cancel, accept);
            dialog.append(text, actions);
            document.body.append(dialog);
            dialog.showModal();
            cancel.focus();
        });
    }
    return { notify, confirm: confirmAction };
})();

document.addEventListener('DOMContentLoaded', () => {
    const main = document.querySelector('main');
    if (main) {
        if (!main.id) main.id = 'mainContent';
        if (!main.hasAttribute('tabindex')) main.tabIndex = -1;
        if (!document.querySelector('.skip-link,.acesso-skip')) {
            const skip = document.createElement('a');
            skip.className = 'skip-link';
            skip.href = '#' + main.id;
            skip.textContent = 'Pular para o conteúdo';
            document.body.prepend(skip);
        }
    }
    // As páginas legadas usam overlay + classe show. Acessibilidade sem alterar esse contrato.
    document.querySelectorAll('.modal-overlay').forEach((overlay, index) => {
        const content = overlay.querySelector('.modal-content, .modal-confirm-content');
        if (!content) return;
        content.setAttribute('role', 'dialog');
        content.setAttribute('aria-modal', 'true');
        const title = content.querySelector('h2');
        if (title) { title.id ||= 'modalTitle' + index; content.setAttribute('aria-labelledby', title.id); }
        let opener;
        const close = () => overlay.classList.remove('show');
        if (overlay.querySelector('form') && !overlay.querySelector('.modal-cancel')) {
            const cancel = document.createElement('button');
            cancel.type = 'button'; cancel.className = 'modal-cancel'; cancel.textContent = 'Cancelar';
            cancel.addEventListener('click', close); content.append(cancel);
        }
        new MutationObserver(() => {
            const open = overlay.classList.contains('show');
            overlay.setAttribute('aria-hidden', String(!open));
            if (open) {
                opener = document.activeElement;
                (content.querySelector('input:not([type=hidden]),button') || content).focus();
            } else if (opener?.isConnected) { opener.focus(); opener = null; }
        }).observe(overlay, { attributes: true, attributeFilter: ['class'] });
        overlay.setAttribute('aria-hidden', 'true');
        overlay.addEventListener('keydown', event => {
            if (event.key === 'Escape') { close(); return; }
            if (event.key !== 'Tab') return;
            const items = [...content.querySelectorAll('a[href],button:not(:disabled),input:not([type=hidden]):not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(el => el.getClientRects().length);
            const first = items[0], last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        });
    });
    const toggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    if (toggle && sidebar) {
        toggle.setAttribute('aria-label', 'Recolher ou expandir navegação');
        toggle.setAttribute('aria-controls', sidebar.id);
        const sync = () => toggle.setAttribute('aria-expanded', String(!sidebar.classList.contains('collapsed')));
        new MutationObserver(sync).observe(sidebar, { attributes: true, attributeFilter: ['class'] });
        sync();
    }
});
