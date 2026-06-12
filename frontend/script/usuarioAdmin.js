document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o formulário de recarregar a página

    // 1. Captura os dados digitados no formulário
    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Limpa mensagens de erro anteriores
    errorMessage.style.display = 'none';

    // 2. CONFIGURAÇÃO DO ADMIN (Você pode alterar esse usuário e senha se quiser)
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = 'admin123';

    // 3. Validação Fictícia (Mock)
    if (usernameInput === ADMIN_USER && passwordInput === ADMIN_PASS) {
        
        // Se acertou, salvamos no localStorage do navegador que o Admin está logado
        // Isso simula o comportamento de um token real vindo do Back-end
        localStorage.setItem('token', 'token_falso_gerado_no_front_2026');
        localStorage.setItem('isAdmin', 'true');

        // Redireciona o dono para a página principal
        // Como o script roda sob o contexto do index.html (que está na raiz), o caminho abaixo está correto
        window.location.href = '/pages/homePage.html';
    } else {
        // Se errar as credenciais, exibe a caixinha vermelha de erro na tela
        errorMessage.textContent = 'Acesso negado: Usuário ou senha administrativa incorretos.';
        errorMessage.style.display = 'block';
    }
});