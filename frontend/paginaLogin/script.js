document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.querySelector('#togglePassword');
    const passwordInput = document.querySelector('#password');
    const loginForm = document.querySelector('#loginForm');
    const forgotPasswordLink = document.querySelector('#forgotPassword');

    // 1. Lógica de mostrar/esconder senha (Unificada)
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            const type = isPassword ? 'text' : 'password';
            
            passwordInput.setAttribute('type', type);
            // Mantendo o estilo de span que você usou na segunda versão
            togglePassword.innerHTML = isPassword ? '<span>🗨️</span>' : '<span>👁️‍🗨️</span>';
        });
    }

    // 2. Redirecionamento (Opcional via JS)
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault(); 
            window.location.href = "../redefinirSenha/index.html"; 
        });
    }

    // 3. Lógica de Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.querySelector('#email').value;
        const password = passwordInput.value;

        try {
            const resposta = await fetch('http://localhost:8080/api/carros', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                alert('Login realizado com sucesso!');
                // window.location.href = '/dashboard.html';
            } else {
                alert(`Erro: ${dados.mensagem || 'Credenciais inválidas'}`);
            }
        } catch (error) {
            console.error('Erro na conexão:', error);
            alert('Não foi possível conectar ao servidor.');
        }
    });
});