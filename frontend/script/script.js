const formLogin = document.getElementById("loginForm");

formLogin.addEventListener("submit", async function(event) {
    event.preventDefault();

    const emailInput = document.getElementById("email").value.trim();
    const passwordInput = document.getElementById("password").value;

    if (emailInput === "admin@estacionamento.com" && passwordInput === "admin123") {
        localStorage.setItem("token", "token_admin_gerado_2026");
        localStorage.setItem("isAdmin", "true");
        
        window.location.href = "pageAdminLoginDono.html";
        return; 
    }

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
            localStorage.setItem("isAdmin", "false"); 
            
            window.location.href = "./menu.html";
        } else {
            alert("E-mail ou senha inválidos!");
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro ao conectar com o servidor. Verifique se o Spring Boot está rodando.");
    }
});