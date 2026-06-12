const formLogin = document.getElementById("loginForm");

formLogin.addEventListener("submit", async function(event){
    event.preventDefault();

    const emailInput = document.getElementById("email").value;
    const passwordInput = document.getElementById("password").value;

    // 🚀 PASSO 1: Intercepta se for o Admin ANTES de ir para o Java
    if (emailInput === "admin@estacionamento.com" && passwordInput === "admin123") {
        
        // Simula os dados do admin para salvar na sessão
        const dadosAdmin = { email: emailInput, nome: "Dono do Estacionamento", perfil: "ADMIN" };
        localStorage.setItem("usuarioSessao", JSON.stringify(dadosAdmin));
        
        // Redireciona para a página do admin
        window.location.href = "/pages/usuarioAdmin.html";
        return; // Esse return é fundamental! Ele para o código aqui e impede de executar o fetch abaixo
    }

    // 🚗 PASSO 2: Se NÃO for o admin, o código continua e tenta logar o usuário comum no Java
    try {
        const resposta = await fetch("http://localhost:8080/usuarios/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" }, 
            
            body: JSON.stringify({
                email: emailInput,      
                senha: passwordInput    
            })
        });

        if (resposta.ok) { 
            const dadosUsuario = await resposta.json(); 

            localStorage.setItem("usuarioSessao", JSON.stringify(dadosUsuario));
            
            // Usuário comum vai para o menu geral
            window.location.href = "/pages/menu.html";
        } else {
            alert("E-mail ou senha inválidos!");
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro ao conectar com o servidor. Verifique se o Spring Boot está rodando na porta 8080.");
    }
});