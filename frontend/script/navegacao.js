document.addEventListener('DOMContentLoaded', () => {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> parent of f3c53e3 (Merge branch 'main' of https://github.com/ESTATEC-The-Rockets/projeto-estatec)
=======
>>>>>>> parent of f3c53e3 (Merge branch 'main' of https://github.com/ESTATEC-The-Rockets/projeto-estatec)
    // Proteção de rotas: verifica se o usuário possui sessão ou token ativo
    const tokenAdmin = localStorage.getItem('token');
    const usuarioSessao = localStorage.getItem('usuarioSessao');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    // Se não estiver autenticado, redireciona para a página de login
    if (!tokenAdmin && !usuarioSessao && !isAdmin) {
        window.location.replace('./index.html');
        return;
    }

<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> parent of f3c53e3 (Merge branch 'main' of https://github.com/ESTATEC-The-Rockets/projeto-estatec)
=======
>>>>>>> parent of f3c53e3 (Merge branch 'main' of https://github.com/ESTATEC-The-Rockets/projeto-estatec)
=======
>>>>>>> parent of f3c53e3 (Merge branch 'main' of https://github.com/ESTATEC-The-Rockets/projeto-estatec)
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    document.querySelectorAll('.logout-btn').forEach(link => link.addEventListener('click', () => {
        ['isAdmin', 'token', 'usuarioSessao'].forEach(key => localStorage.removeItem(key));
    }));
    document.querySelectorAll('.logout-btn').forEach(link => { link.setAttribute('aria-label', 'Sair do sistema'); link.title = 'Sair do sistema'; });
});
=======
=======
>>>>>>> parent of f3c53e3 (Merge branch 'main' of https://github.com/ESTATEC-The-Rockets/projeto-estatec)
=======
>>>>>>> parent of f3c53e3 (Merge branch 'main' of https://github.com/ESTATEC-The-Rockets/projeto-estatec)
    document.querySelectorAll('.logout-btn').forEach(link => link.addEventListener('click', (e) => {
        e.preventDefault();
        ['isAdmin', 'token', 'usuarioSessao'].forEach(key => localStorage.removeItem(key));
        window.location.replace('./index.html');
    }));
    document.querySelectorAll('.logout-btn').forEach(link => { link.setAttribute('aria-label', 'Sair do sistema'); link.title = 'Sair do sistema'; });
<<<<<<< HEAD
<<<<<<< HEAD
});
>>>>>>> parent of f3c53e3 (Merge branch 'main' of https://github.com/ESTATEC-The-Rockets/projeto-estatec)
=======
});
>>>>>>> parent of f3c53e3 (Merge branch 'main' of https://github.com/ESTATEC-The-Rockets/projeto-estatec)
=======
});
>>>>>>> parent of f3c53e3 (Merge branch 'main' of https://github.com/ESTATEC-The-Rockets/projeto-estatec)
