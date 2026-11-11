document.addEventListener('DOMContentLoaded', () => {
    const pathParts = location.pathname.split('/');
    const page = pathParts.pop() || 'index.html';
    const emPagesDir = pathParts.includes('pages');

    // 1. ADICIONADO login.html À LISTA DE PÁGINAS PÚBLICAS
    const paginasPublicas = ['index.html', 'login.html', 'redefinirSenha.html', ''];

    const tokenAdmin = localStorage.getItem('token');
    const usuarioSessao = localStorage.getItem('usuarioSessao');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    // Determina o caminho para a página inicial caso precise de redirecionar
    const caminhoRoot = emPagesDir ? '../index.html' : './index.html';

    // Se não estiver autenticado e tentar aceder a uma página privada
    if (!tokenAdmin && !usuarioSessao && !isAdmin && !paginasPublicas.includes(page)) {
        window.location.replace(caminhoRoot);
        return;
    }

    // Ajusta o prefixo dos links consoante a localização da página atual
    const prefixo = emPagesDir ? './' : './pages/';

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
            a.href = prefixo + href;
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

    document.querySelectorAll('.logout-btn').forEach(link => link.addEventListener('click', (e) => {
        e.preventDefault();
        ['isAdmin', 'token', 'usuarioSessao'].forEach(key => localStorage.removeItem(key));
        window.location.replace(caminhoRoot);
    }));
});