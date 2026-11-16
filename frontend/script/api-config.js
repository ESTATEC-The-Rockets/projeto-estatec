window.ESTATEC_API_ORIGIN = window.location.hostname === "estatec.lab"
    ? "http://api.estatec.lab"
    : "http://localhost:8080";

(() => {
    const page = location.pathname.split('/').pop();
    const protectedPage = !['', 'index.html', 'login.html', 'criarConta.html', 'redefinirSenha.html'].includes(page);
    const clearSession = () => ['isAdmin', 'token', 'usuarioSessao'].forEach(key => localStorage.removeItem(key));
    window.estatecLogout = async () => {
        const response = await fetch(window.ESTATEC_API_ORIGIN + '/auth/logout', { method: 'POST', credentials: 'include' });
        if (!response.ok && response.status !== 401) throw new Error('Falha ao encerrar a sessão.');
        clearSession();
    };
    window.estatecSessionReady = protectedPage ? (async () => {
        document.documentElement.style.visibility = 'hidden';
        try {
            const response = await fetch(window.ESTATEC_API_ORIGIN + '/auth/sessao', { credentials: 'include', cache: 'no-store', signal: AbortSignal.timeout(10000) });
            if (!response.ok) throw new Error('Sessão inválida');
            const session = await response.json();
            localStorage.setItem('isAdmin', String(session.admin === true || session.podeGerenciar === true));
            return session;
        } catch {
            clearSession(); location.replace('./login.html'); return null;
        } finally { document.documentElement.style.visibility = ''; }
    })() : Promise.resolve(null);
    window.estatecFetch = async (url, options = {}) => {
        if (protectedPage && !await window.estatecSessionReady) throw new Error('Entre no sistema para continuar.');
        const response = await fetch(url, { ...options, credentials: 'include' });
        if (protectedPage && response.status === 401) { clearSession(); location.replace('./login.html'); }
        return response;
    };
    addEventListener('pageshow', event => { if (event.persisted && protectedPage) location.reload(); });
})();
