document.addEventListener("DOMContentLoaded", () => {

    const cadastroForm = document.getElementById("cadastroForm");
    const corpoTabela = document.getElementById("corpoTabela");

    const inputId = document.getElementById("estacionamentoId");
    const inputNome = document.getElementById("nomeEstacionamento");

    const btnCadastrar = document.querySelector(".btn-cadastrar");

    /* =========================
       CARREGAR TABELA
    ========================= */

    async function carregarTabela() {

        try {

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Erro ao buscar dados.");
            }

            const estacionamentos =
                await response.json();

            corpoTabela.innerHTML = "";

            estacionamentos.forEach(estac => {

                corpoTabela.innerHTML += `
                    <tr>
                        <td>${estac.nomeEstacionamento}</td>

                        <td class="text-center">

                            <button
                                class="btn-editar"
                                onclick="preencherFormulario(
                                    ${estac.id},
                                    '${estac.nomeEstacionamento}'
                                )">

                                Editar

                            </button>

                            <button
                                class="btn-excluir"
                                onclick="deletarEstacionamento(
                                    ${estac.id}
                                )">

                                Excluir

                            </button>

                        </td>
                    </tr>
                `;
            });

        } catch (error) {

            console.error(error);

            corpoTabela.innerHTML = `
                <tr>
                    <td colspan="2">
                        Erro ao carregar dados.
                    </td>
                </tr>
            `;
        }
    }

    /* =========================
       CADASTRAR / EDITAR
    ========================= */

    cadastroForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const id = inputId.value;

        const estacionamento = {
            nomeEstacionamento: inputNome.value.trim()
        };

        if (!estacionamento.nomeEstacionamento) {

            alert("Informe o nome do estacionamento.");
            return;
        }

        try {

            if (id) {

                await atualizarEstacionamento(
                    id,
                    estacionamento
                );

            } else {

                const response = await fetch(API_URL, {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(
                        estacionamento
                    )
                });

                if (!response.ok) {
                    throw new Error();
                }

                alert("Estacionamento cadastrado com sucesso!");

                limparFormulario();

                carregarTabela();
            }

        } catch (error) {

            console.error(error);

            alert(
                "Erro ao conectar com o servidor."
            );
        }
    });

    /* =========================
       PREENCHER FORMULÁRIO
    ========================= */

    window.preencherFormulario = (
        id,
        nome
    ) => {

        inputId.value = id;

        inputNome.value = nome;

        btnCadastrar.textContent =
            "ATUALIZAR";

        btnCadastrar.style.background =
            "#f59e0b";

        inputNome.focus();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    /* =========================
       ATUALIZAR
    ========================= */

    async function atualizarEstacionamento(
        id,
        dados
    ) {

        try {

            const response = await fetch(
                `${API_URL}/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                        "application/json"
                    },

                    body: JSON.stringify(
                        dados
                    )
                }
            );

            if (!response.ok) {
                throw new Error();
            }

            alert(
                "Estacionamento atualizado com sucesso!"
            );

            limparFormulario();

            carregarTabela();

        } catch (error) {

            console.error(error);

            alert(
                "Erro ao atualizar estacionamento."
            );
        }
    }

    /* =========================
       EXCLUIR
    ========================= */

    window.deletarEstacionamento =
    async (id) => {

        const confirmar = confirm(
            "Deseja realmente excluir este estacionamento?"
        );

        if (!confirmar) return;

        try {

            const response = await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );

            if (!response.ok) {
                throw new Error();
            }

            alert(
                "Estacionamento removido com sucesso!"
            );

            carregarTabela();

        } catch (error) {

            console.error(error);

            alert(
                "Erro ao excluir estacionamento."
            );
        }
    };

    /* =========================
       LIMPAR FORMULÁRIO
    ========================= */

    function limparFormulario() {

        cadastroForm.reset();

        inputId.value = "";

        btnCadastrar.textContent =
            "CADASTRAR";

        btnCadastrar.style.background =
            "";
    }

    /* =========================
       INICIALIZAÇÃO
    ========================= */

    carregarTabela();

});