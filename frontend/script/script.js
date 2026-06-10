const formLogin = document.getElementById("form-login");
const mensagemErro = document.getElementById("mensagem-erro");

formLogin.addEventListener("submit", async function(event){
    // Evita que o navegador recarregue a página ao clicar no botão "Entrar"
    event.preventDefault();

    // Captura os valores digitados nos inputs
    const loginInput = document.getElementById("login").value;
    const senhaInput = document.getElementById("senha").value;

    try {
        // Dispara um POST enviando o login e senha no "corpo" (body) da requisição
        const resposta = await fetch("http://localhost:8080/api/usuarios/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" }, // Avisa que estamos a enviar um JSON
            body: JSON.stringify({
                login: loginInput,
                senha: senhaInput
            })
        });

        // Se a API retornar um status de sucesso (200 OK)
        if (resposta.ok) {
            const dadosUsuario = await resposta.json();

            // Grava os dados do usuário na memória do navegador (localStorage)
            localStorage.setItem("usuarioSessao", JSON.stringify(dadosUsuario));

            // Redireciona o utilizador para a tela de administração
            window.location.href = "\pages\admin.html";
        } else {
            mensagemErro.innerText = "Usuário ou senha inválidos!";
        }
    } catch (erro) {
        console.error(erro);
        mensagemErro.innerText = "Erro ao conectar com o servidor.";
    }
});