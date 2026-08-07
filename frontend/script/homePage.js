// Executa assim que a página carrega
document.addEventListener('DOMContentLoaded', function() {
    
    // Verifica se a marcação de Admin NÃO existe no navegador
    if (localStorage.getItem('isAdmin') !== 'true') {
        alert('Acesso não autorizado! Por favor, faça login.');
        
        // Como a homePage.html está dentro da pasta 'pages', 
        // precisamos usar '../' para voltar uma pasta e achar o index.html na raiz
        window.location.href = '../index.html';
    }
});
localStorage.clear();
window.location.href = '../index.html';