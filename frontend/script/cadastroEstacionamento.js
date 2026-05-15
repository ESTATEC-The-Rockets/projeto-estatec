// script/cadastroEstacionamento.js

document.addEventListener('DOMContentLoaded', () => {
    const cadastroForm = document.getElementById('cadastroForm');
    const corpoTabela = document.getElementById('corpoTabela');

    // --- 4.2 LISTAGEM (Baseado no listarAlunos.js) ---
    async function carregarTabela() {
        try {
            const response = await fetch(API_URL); // API_URL vem do api.js
            if (!response.ok) throw new Error('Erro ao buscar dados');
            
            const estacionamentos = await response.json();
            corpoTabela.innerHTML = ''; // Limpa a tabela para não duplicar

            estacionamentos.forEach(estac => {
                const linha = `
                    <tr>
                        <td>${estac.nomeEstacionamento}</td>
                        <td>
                            <button class="btn-edit" onclick="preencherFormulario(${estac.id}, '${estac.nomeEstacionamento}')">Editar</button>
                            <button class="btn-del" onclick="deletarEstacionamento(${estac.id})">Excluir</button>
                        </td>
                    </tr>
                `;
                corpoTabela.innerHTML += linha;
            });
        } catch (error) {
            console.error("Erro na listagem:", error);
        }
    }

    // --- 4.3 CADASTRO (Baseado no cadastrarAluno.js) ---
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Impede o recarregamento da página

            const id = document.getElementById('estacionamentoId').value;
            const estacionamento = {
                nomeEstacionamento: document.getElementById('nomeEstacionamento').value
            };

            if (id) {
                // Se existe ID, chama a função de atualizar (PUT)
                await atualizarEstacionamento(id, estacionamento);
            } else {
                // Se NÃO existe ID, executa o cadastro (POST)
                try {
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(estacionamento)
                    });

                    if (response.ok) {
                        alert("Cadastrado com sucesso!");
                        cadastroForm.reset();
                        carregarTabela(); // Atualiza a lista lá embaixo
                    }
                } catch (error) {
                    alert("Erro ao conectar com o servidor.");
                }
            }
        });
    }

    // --- 4.4 EDIÇÃO (Baseado no editarAluno.js) ---
    window.preencherFormulario = (id, nome) => {
        document.getElementById('estacionamentoId').value = id; // Define o ID oculto
        document.getElementById('nomeEstacionamento').value = nome; // Preenche o campo nome
    };

    async function atualizarEstacionamento(id, dados) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            if (response.ok) {
                alert("Atualizado com sucesso!");
                document.getElementById('estacionamentoId').value = ''; // Limpa o ID oculto
                cadastroForm.reset(); // Limpa os campos visuais
                carregarTabela(); // Recarrega a tabela com os novos dados
            }
        } catch (error) {
            alert("Erro ao atualizar.");
        }
    }

    // --- 4.5 EXCLUSÃO (Baseado no deletarAluno.js) ---
    window.deletarEstacionamento = async (id) => {
        if (confirm("Tem certeza que deseja excluir este estacionamento?")) {
            try {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    alert("Removido com sucesso!");
                    carregarTabela(); // Recarrega a lista para sumir com o item
                }
            } catch (error) {
                alert("Erro ao excluir.");
            }
        }
    };

    // Inicialização: Chama a função assim que o arquivo é lido para mostrar os dados iniciais
    carregarTabela();
});