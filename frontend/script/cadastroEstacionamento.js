const formCadastro = document.getElementById("cadastroForm");

formCadastro.addEventListener("submit", async function(event) {
    event.preventDefault();

    const idInput = document.getElementById("estacionamentoId").value;
    const nomeInput = document.getElementById("nomeEstacionamento").value;

    const urlBase = "http://localhost:8080/estacionamento";
    let urlConfigurada = urlBase;
    let metodoHttp = "POST"; 

    if (idInput) {
        urlConfigurada = `${urlBase}/${idInput}`; 
        metodoHttp = "PUT";
    }

    try {
        const resposta = await fetch(urlConfigurada, {
            method: metodoHttp,
            headers: { "Content-Type": "application/json" },
            
            body: JSON.stringify({
                nomeEstacionamento: nomeInput 
            })
        });

        if (resposta.ok) {
            const dadosSalvos = await resposta.json(); 

            if (metodoHttp === "POST") {
                alert("Estacionamento cadastrado com sucesso!"); 
            } else {
                alert("Estacionamento atualizado com sucesso!"); 
            }

            formCadastro.reset(); 
        } else {
            alert("Erro ao salvar! Certifique-se de que o nome possui apenas letras e espaços, ou que não seja duplicado.");
        }

    } catch (erro) {
        console.error(erro);
        alert("Erro de conexão. Certifique-se de que o Spring Boot está rodando.");
    }
});