document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.querySelector('#togglePassword');
    const passwordInput = document.querySelector('#password');
    const loginForm = document.querySelector('#loginForm');
    const forgotPasswordLink = document.querySelector('#forgotPassword');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            const type = isPassword ? 'text' : 'password';

            passwordInput.setAttribute('type', type);
            togglePassword.innerHTML = isPassword ? '<span>🗨️</span>' : '<span>👁️‍🗨️</span>';
        });
    }

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = "../redefinirSenha/index.html";
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.querySelector('#email').value;
            const password = passwordInput.value;

            if (email && password) {
                window.location.href = "../menuInicial/index.html";
            } else {
                alert("Por favor, preencha o e-mail e a senha.");
            }
        });
    }
});