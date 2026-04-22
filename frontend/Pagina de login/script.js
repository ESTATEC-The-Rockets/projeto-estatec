document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.querySelector('#togglePassword');
    const passwordInput = document.querySelector('#password');
    const loginForm = document.querySelector('#loginForm');

    // Alternar visibilidade da senha
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Troca o ícone (simples alteração de emoji para o exemplo)
        togglePassword.textContent = type === 'password' ? '👁️‍🗨️​' : '🙈';
    });

    // Simulação de Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.querySelector('#email').value;
        
        alert(`Tentativa de login com: ${email}\nFuncionalidade de backend não implementada.`);
    });
});