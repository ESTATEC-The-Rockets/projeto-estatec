document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.querySelector('#togglePassword');
    const passwordInput = document.querySelector('#password');
    const loginForm = document.querySelector('#loginForm');
    
    // Seleciona o link pelo ID que criamos
    const forgotPasswordLink = document.querySelector('#forgotPassword');

    // Lógica para redirecionar
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault(); // Impede o link de recarregar a página
            window.location.href = "../redefinirSenha/index.html"; 
        });
    }

    // Alternar visibilidade da senha (com o ícone correto)
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Mantendo o estilo de contorno solicitado anteriormente
        togglePassword.innerHTML = type === 'password' ? '<span>👁️</span>' : '<span>🙈</span>';
    });

    // Simulação de Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.querySelector('#email').value;
        alert(`Tentativa de login com: ${email}\nFuncionalidade de backend não implementada.`);
    });
});