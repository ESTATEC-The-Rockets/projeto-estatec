document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.querySelector('#togglePassword');
    const passwordInput = document.querySelector('#password');
    const loginForm = document.querySelector('#loginForm');
    
    // Seleciona o link pelo ID que criamos
    const forgotPasswordLink = document.querySelector('#forgotPassword');

<<<<<<< HEAD
    // Manter sua lógica de mostrar/esconder senha...
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.textContent = type === 'password' ? '👁️‍🗨️' : '🗨️';
=======
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
>>>>>>> abf97a72216b9f679683260908be4e5d329c0c1a
    });

    // --- NOVA LÓGICA DE LOGIN ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Capturar os valores dos campos
        const email = document.querySelector('#email').value;
<<<<<<< HEAD
        const password = passwordInput.value;

        try {
            // 2. Enviar para o Back-end usando fetch
            const resposta = await fetch('http://localhost:8080/api/carros', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Avisa o servidor que estamos enviando JSON
                },
                body: JSON.stringify({ email, password }) // Transforma os dados em texto
            });

            // 3. Receber a resposta do servidor
            const dados = await resposta.json();

            if (resposta.ok) {
                alert('Login realizado com sucesso!');
                // Aqui você poderia redirecionar o usuário: window.location.href = '/dashboard';
            } else {
                alert(`Erro: ${dados.mensagem}`);
            }
        } catch (error) {
            console.error('Erro na conexão:', error);
            alert('Não foi possível conectar ao servidor.');
        }
=======
        alert(`Tentativa de login com: ${email}\nFuncionalidade de backend não implementada.`);
>>>>>>> abf97a72216b9f679683260908be4e5d329c0c1a
    });
});