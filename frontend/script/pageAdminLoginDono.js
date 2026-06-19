document.addEventListener("DOMContentLoaded", () => {
    
    // PROTEÇÃO DE ROTA: Impede que qualquer pessoa digite a URL no navegador sem estar logado como Admin
    const isAdmin = localStorage.getItem("isAdmin");
    const token = localStorage.getItem("token");

    if (!isAdmin || isAdmin !== "true" || !token) {
        alert("Acesso negado. Por favor, faça login como Administrador primeiro.");
        window.location.href = "../index.html";
        return;
    }

    const formCadastro = document.getElementById("formCadastroDono");

    if (formCadastro) {
        formCadastro.addEventListener("submit", async function(event) {
            event.preventDefault();

            // CAPTURA E LIMPEZA COMPLETA: Remove parênteses, espaços, pontos e traços
            const cpfLimpo = document.getElementById("cad-cpf").value.replace(/\D/g, '');
            const rgLimpo = document.getElementById("cad-rg").value.replace(/\D/g, '');
            const telefoneLimpo = document.getElementById("cad-telefone").value.replace(/\D/g, '');

            // Monta o objeto respeitando exatamente as variáveis do seu Usuario.java
            const novoUsuario = {
                nome: document.getElementById("cad-nome").value,
                cpf: cpfLimpo,           // Envia apenas os 11 números
                rg: rgLimpo,             // Envia apenas números curtos (evita o erro 'Data too long')
                dataNascimento: document.getElementById("cad-dataNascimento").value,
                telefone: telefoneLimpo, // Envia apenas números puros (ex: 11988887777) para a @TelefoneBR
                email: document.getElementById("cad-email").value,
                senha: document.getElementById("cad-senha").value
            };

            try {
                const resposta = await fetch("http://localhost:8080/usuarios/cadastro", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(novoUsuario)
                });

                if (resposta.ok) {
                    alert("Dono de estacionamento cadastrado com sucesso no Banco de Dados!");
                    formCadastro.reset(); // Limpa o formulário para o próximo cadastro
                } else {
                    alert("Erro ao cadastrar. Verifique se os dados cumprem os requisitos (Ex: Nome apenas com letras, senha com tamanho correto, CPF válido).");
                }

            } catch (erro) {
                console.error("Erro:", erro);
                alert("Erro de conexão com o servidor. O Spring Boot está ativo?");
            }
        });
    }
});

// Função para fazer Logout com segurança
function sairAdmin() {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    window.location.href = "../index.html"; 
}