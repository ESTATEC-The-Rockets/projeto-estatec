document.addEventListener('DOMContentLoaded', () => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const isUser = localStorage.getItem('isAdmin') === 'false';
    let usuarioSessao = null;

    if (isUser) {
        try {
            usuarioSessao = JSON.parse(localStorage.getItem('usuarioSessao'));
        } catch {
            usuarioSessao = null;
        }
    }

    const userId = usuarioSessao && (usuarioSessao.id ?? usuarioSessao.idUsuario);
    const usuarioAutenticado = isUser && Number.isInteger(Number(userId)) && Number(userId) > 0;
    if (!isAdmin && !usuarioAutenticado) {
        ['isAdmin', 'token', 'usuarioSessao'].forEach(key => localStorage.removeItem(key));
        window.location.replace('./login.html');
        return;
    }

    const page = location.pathname.split('/').pop();
    const links = [
        ['menu.html', 'Menu', 'house'],
        ['usuario.html', 'Usuários', 'user'],
        ['carros.html', 'Carros', 'car'],
        ['estacionamentos.html', 'Estacionamentos', 'square-parking'],
        ['dados.html', 'Histórico', 'clock-rotate-left']
    ];
    const activePage = page === 'perfil.html' ? 'usuario.html' : page === 'estacionamento.html' ? 'estacionamentos.html' : page;
    const nav = document.querySelector('.sidebar-nav ul');
    if (nav) {
        nav.replaceChildren();
        for (const [href, label, icon] of links) {
            const li = document.createElement('li');
            li.className = 'nav-item' + (activePage === href ? ' active' : '');
            const a = document.createElement('a');
            a.href = './' + href;
            a.setAttribute('aria-label', label);
            a.title = label;
            if (activePage === href) a.setAttribute('aria-current', 'page');
            const i = document.createElement('i');
            i.className = 'fa-solid fa-' + icon;
            i.setAttribute('aria-hidden', 'true');
            const span = document.createElement('span');
            span.className = 'menu-text';
            span.textContent = label;
            a.append(i, span);
            li.append(a);
            nav.append(li);
        }
    }

    document.querySelectorAll('.logout-btn').forEach(link => { link.setAttribute('aria-label', 'Sair do sistema'); link.title = 'Sair do sistema'; });
    document.querySelectorAll('.logout-btn').forEach(link => link.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await fetch(window.ESTATEC_API_ORIGIN + '/usuarios/logout', { method: 'POST', credentials: 'include' });
        } catch (_) {
            // Limpa a sessão local mesmo quando a rede estiver indisponível.
        }
        ['isAdmin', 'token', 'usuarioSessao'].forEach(key => localStorage.removeItem(key));
        window.location.replace('./login.html');
    }));
});
