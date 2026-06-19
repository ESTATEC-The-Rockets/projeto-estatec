const formLogin = document.getElementById("loginForm");

formLogin.addEventListener("submit", async function(event) {
    event.preventDefault();

    const emailInput = document.getElementById("email").value.trim();
    const passwordInput = document.getElementById("password").value;

    // 1. VALIDAÇÃO LOCAL DO ADMINISTRADOR GERAL
    if (emailInput === "admin@estacionamento.com" && passwordInput === "admin123") {
        localStorage.setItem("token", "token_admin_gerado_2026");
        localStorage.setItem("isAdmin", "true");
        
        // Redireciona diretamente para o painel de administração de donos
        window.location.href = "pages/pageAdminLoginDono.html";
        return; 
    }

    // 2. LOGIN DOS DONOS DE ESTACIONAMENTO VIA API SPRING BOOT
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
            localStorage.setItem("isAdmin", "false"); // Garante que não é admin geral
            
            window.location.href = "pages/menu.html";
        } else {
            alert("E-mail ou senha inválidos!");
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro ao conectar com o servidor. Verifique se o Spring Boot está rodando.");
    }
});