"use strict";
(() => {
    const form = document.getElementById('cadastroContaForm');
    const nome = document.getElementById('nome');
    const email = document.getElementById('email');
    const senha = document.getElementById('password');
    const confirmacao = document.getElementById('confirmacaoSenha');
    const feedback = document.getElementById('cadastroFeedback');
    const button = form.querySelector('[type="submit"]');
    const toggle = document.getElementById('togglePassword');
    let busy = false;
    const show = (text, state = 'error') => { feedback.textContent = text; feedback.dataset.state = state; };
    const validate = () => {
        nome.setCustomValidity(nome.value.trim() ? '' : 'Informe seu nome.');
        confirmacao.setCustomValidity(confirmacao.value && senha.value !== confirmacao.value ? 'As senhas não conferem.' : '');
        senha.setCustomValidity(new TextEncoder().encode(senha.value).length > 72 ? 'A senha deve ter no máximo 72 bytes. Use uma senha mais curta.' : '');
    };
    form.addEventListener('input', event => { event.target.removeAttribute('aria-invalid'); validate(); });
    form.addEventListener('invalid', event => {
        event.target.setAttribute('aria-invalid', 'true'); show(event.target.validationMessage);
    }, true);
    toggle.addEventListener('click', () => {
        const visible = senha.type === 'password';
        senha.type = visible ? 'text' : 'password';
        confirmacao.type = senha.type;
        toggle.textContent = visible ? 'Ocultar senha' : 'Mostrar senha';
        toggle.setAttribute('aria-pressed', String(visible));
    });
    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (busy) return;
        nome.value = nome.value.trim(); email.value = email.value.trim();
        validate(); if (!form.reportValidity()) return;
        busy = true; button.disabled = true; button.textContent = 'Criando conta…';
        form.setAttribute('aria-busy', 'true'); show('Salvando sua conta…', 'loading');
        try {
            const response = await window.estatecFetch(window.ESTATEC_API_ORIGIN + '/auth/cadastro', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome: nome.value, email: email.value, senha: senha.value, confirmacaoSenha: confirmacao.value }),
                signal: AbortSignal.timeout(15000)
            });
            const body = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(body.message || 'Não foi possível criar a conta. Tente novamente.');
            senha.value = ''; confirmacao.value = '';
            show('Conta criada! Abrindo o login…', 'success');
            location.replace('./login.html?cadastro=sucesso');
        } catch (error) {
            show(error.name === 'TimeoutError' ? 'O servidor demorou para responder. Tente entrar com os dados informados antes de repetir o cadastro.' : error instanceof TypeError ? 'Não foi possível conectar ao servidor. Verifique sua conexão.' : error.message);
            busy = false; button.disabled = false; button.textContent = 'Criar conta';
            form.setAttribute('aria-busy', 'false');
        }
    });
})();
