document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.querySelector('#togglePassword');
    const passwordInput = document.querySelector('#password');
    const loginForm = document.querySelector('#loginForm');
    const forgotPasswordLink = document.querySelector('#forgotPassword');

    // 1. Lógica de mostrar/esconder senha
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            const type = isPassword ? 'text' : 'password';

            passwordInput.setAttribute('type', type);
            togglePassword.innerHTML = isPassword ? '<span>🗨️</span>' : '<span>👁️‍🗨️</span>';
        });
    }

    // 2. Redirecionamento Esqueci a Senha
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = "../redefinirSenha/index.html";
        });
    }

    // 3. Lógica de Login: Redirecionamento Direto
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Evita que a página recarregue

            const email = document.querySelector('#email').value;
            const password = passwordInput.value;

            // Simples validação de campos vazios (opcional, pois o HTML já tem 'required')
            if (email && password) {
                // REDIRECIONA PARA A PÁGINA DESEJADA
                window.location.href = "../menuInicial/index.html";
            } else {
                alert("Por favor, preencha o e-mail e a senha.");
            }
        });
    }
});