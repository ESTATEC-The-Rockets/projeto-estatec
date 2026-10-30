document.addEventListener('DOMContentLoaded', () => {
    const page = location.pathname.split('/').pop();
    const header = document.querySelector('.header');
    if (header && page !== 'menu.html' && !header.querySelector('.home-nav-button')) {
        const home = document.createElement('a');
        home.className = 'home-nav-button';
        home.href = './menu.html';
        home.setAttribute('aria-label', 'Voltar ao menu');
        home.title = 'Voltar ao menu';
        home.innerHTML = '<i class="fa-solid fa-house" aria-hidden="true"></i>';
        header.insertBefore(home, header.firstElementChild);
    }
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
        if (localStorage.getItem('isAdmin') === 'true') {
            const li = document.createElement('li');
            li.className = 'nav-item';
            const a = document.createElement('a');
            a.href = './adminCrud.html';
            a.setAttribute('aria-label', 'Administração');
            a.title = 'Administração';
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-sliders';
            icon.setAttribute('aria-hidden', 'true');
            const text = document.createElement('span');
            text.className = 'menu-text';
            text.textContent = 'Administração';
            a.append(icon, text);
            li.append(a);
            nav.append(li);
        }
    }
    document.querySelectorAll('.logout-btn').forEach(link => link.addEventListener('click', () => {
        ['isAdmin', 'token', 'usuarioSessao'].forEach(key => localStorage.removeItem(key));
    }));
    document.querySelectorAll('.logout-btn').forEach(link => { link.setAttribute('aria-label', 'Sair do sistema'); link.title = 'Sair do sistema'; });
});
